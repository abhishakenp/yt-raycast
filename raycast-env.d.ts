/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `search` command */
  export type Search = ExtensionPreferences & {}
  /** Preferences accessible in the `watching` command */
  export type Watching = ExtensionPreferences & {}
  /** Preferences accessible in the `trending` command */
  export type Trending = ExtensionPreferences & {}
  /** Preferences accessible in the `history` command */
  export type History = ExtensionPreferences & {}
  /** Preferences accessible in the `setup` command */
  export type Setup = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `search` command */
  export type Search = {
  /** e.g. lofi hip hop */
  "query": string
}
  /** Arguments passed to the `watching` command */
  export type Watching = {}
  /** Arguments passed to the `trending` command */
  export type Trending = {}
  /** Arguments passed to the `history` command */
  export type History = {}
  /** Arguments passed to the `setup` command */
  export type Setup = {}
}

