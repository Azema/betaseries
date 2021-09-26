<?php
require 'vendor/autoload.php';
require './config.php';

use GuzzleHttp\Client;

$client = new Client([
    // You can set any number of default request options.
    'timeout'  => 2.0,
    'verify' => __DIR__ . '/cacert.pem'
]);
try {
	$response = $client->request('POST', 'https://api.betaseries.com/oauth/access_token', [
		'form_params' => [
			'client_id' => CLIENT_ID,
			'client_secret' => CLIENT_SECRET,
			'redirect_uri' => URL_REDIRECT,
			'code' => $_GET['code']
		]
	]);
	$accessToken = json_decode((string)$response->getBody())->access_token;
	echo '<script>window.parent.postMessage({ message: "access_token", value: "' . $accessToken . '" }, "*");</script>';
} catch(Exception $ex) {
	$msg = $ex->getMessage();
	echo '<script>window.parent.postMessage({ message: "error", value: "' . $msg . '" }, "*");</script>';
}

?>
