#!/bin/bash

#######################################################################################
#                                       README
#######################################################################################
#
# /!\ Indiquez dans la variable "NAME", le nom du domain que vous souhaitez signer. /!\
# /!\ Actuellement, c'est pour le domaine local (localhost)                         /!\
# /!\ Indiquez aussi votre adresse IP de votre réseau local (IP.1)                  /!\
#
# Sur Windows:
# + Importer `myCA.pem` dans le magasin d'authorités de Windows (certmgr)
#   * Dans "Autorités de certification intermédiaires > Certificats"
#   * Dans "Personnel > Certificats"
#
# + Importer `myCA.pem` dans le magasin d'authorités de Chrome
#       (Paramètres > Confidentialité et sécurité > Gérer les certificats)
#   * Dans "Autorités de certification intermédiaires > Certificats"
#   * Dans "Personnel > Certificats"
#
# + Sur votre serveur (Ici c'est Grunt-Connect sur le fichier Gruntfile)
#    * Dans la section 'connect > server > options' indiquez les fichiers suivants:
#      - key: 'your-domain.key'
#      - cert: 'your-domain.crt'
#      - ca: 'myCA.pem'
#

#################################
# Become a Certificate Authority
#################################

# Generate private key
openssl genrsa -des3 -out myCA.key 2048
# Generate root certificate
openssl req -x509 -new -nodes -key myCA.key -sha256 -days 825 -out myCA.pem

#########################
# Create CA-signed certs
#########################

NAME="localhost" # Use your own domain name
# Generate a private key
openssl genrsa -out "$NAME.key" 2048
# Create a certificate-signing request
openssl req -new -key "$NAME.key" -out "$NAME.csr"
# Create a config file for the extensions
>$NAME.ext cat <<-EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names
[alt_names]
DNS.1 = $NAME # Be sure to include the domain name here because Common Name is not so commonly honoured by itself
IP.1 = 192.168.1.12 # Optionally, add an IP address (if the connection which you have planned requires it)
IP.2 = 127.0.0.1
EOF
# Create the signed certificate
openssl x509 -req -in "$NAME.csr" -CA myCA.pem -CAkey myCA.key -CAcreateserial -out "$NAME.crt" -days 825 -sha256 -extfile "$NAME.ext"
