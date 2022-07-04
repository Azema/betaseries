// Type definitions for betaseries 1.4.0
// Project: betaseries
// Definitions by: Manuel Hervo
/*~ This is the module template file. You should rename it to index.d.ts
 *~ and place it in a folder with the same name as the module.
 *~ For example, if you were writing a file for "super-greeter", this
 *~ file should be 'super-greeter/index.d.ts'
 */
/*~ If this module is a UMD module that exposes a global variable 'myLib' when
 *~ loaded outside a module loader environment, declare that global here.
 *~ Otherwise, delete this declaration.
 */
/// <reference types="jquery" />
/// <reference types="bootstrap" />

export interface TooltipOption {
    /**
     * How to position the tooltip or popover - auto | top | bottom | left | right.
     * When "auto" is specified, it will dynamically reorient the tooltip or popover.
     *
     * When a function is used to determine the placement, it is called with
     * the tooltip or popover DOM node as its first argument and the triggering element DOM node as its second.
     * The `this` context is set to the tooltip or popover instance.
     *
     * @default tooltip: "top", popover: "right"
     */
    placement?: Placement | ((tip: HTMLElement, elt: Element) => Placement) | undefined;
}

import Base from "./types/Base";
import CacheUS from "./types/Cache";
import Character from "./types/Character";
import CommentBS from "./types/Comment";
import CommentsBS from "./types/Comments";
import Episode from "./types/Episode";
import Media from "./types/Media";
import Member from "./types/Member";
import Movie from "./types/Movie";
import Note from "./types/Note";
import NotificationBS from "./types/Notification";
import Search from "./types/Search";
import Season from "./types/Season";
import Show from "./types/Show";
import Similar from "./types/Similar";
import Subtitle from "./types/Subtitle";
import UpdateAuto from "./types/UpdateAuto";
import User from "./types/User";

export {Base, CacheUS, Character, CommentBS, CommentsBS, Episode, Media, Member, Movie, Note, NotificationBS, Search, Season, Show, Similar, Subtitle, UpdateAuto, User, Tooltip};