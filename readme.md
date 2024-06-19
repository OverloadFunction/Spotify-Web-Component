# Spotify Web Component

Spotify Music Component | v1.0.0

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Credits](#credits)

## Introduction

A Spotify component written in JavaScript, HTML5, and CSS. It uses Spotify's API to add songs via track IDs. As I am writing this, it is in version 1.0.0, with updates to come.


## Installation

### Prerequisites

1. **Spotify Developer Account**: To use the Spotify API, you need to have a Spotify Developer account. You can sign up at the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/login).

### Obtaining Spotify Client ID and Secret

1. **Log in** to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/login).
2. **Create an App**:
    - Click on the "Create an App" button.
    - Fill in the required details like the App name and description.
    - Accept the terms and conditions.
    - Click "Create".

3. **Retrieve Client ID and Client Secret**:
    - After creating the app, you will be redirected to the app's dashboard.
    - Here, you will find the `Client ID` and `Client Secret`. Note them down as you will need them to authenticate your requests to the Spotify API.

### Setting it up

1. **Clone the repository**:
    ```bash
    git clone https://github.com/OverloadFunction/Spotify-Web-Component.git
    ```

2. **Configure the playr.js file**:
    - Navigate to `player.js`
    - Edit the `clientId` and `clientSecret` variables located on line 66 and 67
    ```js
    var clientId = 'yourclientID';
    var clientSecret = 'yourclientSECRET';
    ```

3. **Change what songs are accessible**:
    - You will first need to find your song's track ID. I will make a public repository that allows you to do this easily soon.
    - Once you have a track ID, go to line 56 in `player.js`
    - Simply add the track IDs to the array, and they will be implemented.
    - Please note that not all songs are accessible.

4. **Open the index.html file**:
    - Open the `index.html` file in your web broswer to star the project

## Credits

Special thanks to dove who provided the base for this project:

- https://github.com/wife   - Github
- https://shaymin.net/      - Website


---
