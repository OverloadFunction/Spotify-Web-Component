var Player = function() {

  var ui = {
    holder: {
      holder: '.player_holder',
      flippedClass: 'player_holder--flipped'
    },
    cover: {
      cover: '.player_cover',
      errorClass: 'player_cover--error',
      openClass: 'player_cover--open'
    },
    list: {
      list: '.player_list',
      openClass: 'player_list--open'
    },
    tracks: {
      list: '.tracks_list',
      track: '.tracks_track',
      activeClass: 'tracks_track--active'
    },
    options: {
      random: '.options_btn--random',
      playlist: '.options_btn--playlist',
      activeClass: 'options_btn--active'
    },
    info: {
      title: '.player_title',
      artist: '.player_artist'
    },
    progressBarHolder: '.player_progressbar-holder',
    progressBar: '.player_progressbar',
    controls: {
      prev: '.controls_btn--prev',
      next: '.controls_btn--next',
      play: {
        playPause: '.controls_btn--play-pause',
        playIconClass: 'fa-play',
        pauseIconClass: 'fa-pause'
      }
    },
    volume: {
      slider: '#volume-slider'
    }
  };

  var songs = [];
  var songIndex = 0;
  var maxSongIndex = 0;
  var trackPositions = [];
  var songTimer = {};
  var history = [];
  var isPlaying = false;
  var isShuffle = false;
  var accessToken = '';
  var trackIds = [
    '1WbhIxkn5ECsOwUm795iX1', // Star Shopping by Lil Peep
    '6Ac8Byr6GByGr3wDH7JjYh', // Save That Shit by Lil Peep
    '3VZlCJimDGY0D7YEC7S351', // White Tee by Lil Peep
    '4PTG3Z6ehGkBFwjybzWkR8' // Never Gonna Give You Up
  ];

  var audio = null;

  var getAccessToken = function() {
    var clientId = '';                                          // Please enter your spotify client Id
    var clientSecret = '';                                      // Please enter your spotify client Secret
                                                                // If you're unsure how please look at readme.md
    $.ajax({
      url: 'https://accounts.spotify.com/api/token',
      type: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
      },
      data: {
        'grant_type': 'client_credentials'
      },
      success: function(response) {
        accessToken = response.access_token;
        console.log('Access token:', accessToken);
        loadTracks();
      },
      error: function(xhr, status, error) {
        console.error('Error fetching access token:', error);
      }
    });
  };

  var loadTracks = function() {
    trackIds.forEach(function(trackId) {
      fetchTrack(trackId);
    });
  };

  var fetchTrack = function(trackId) {
    $.ajax({
      url: 'https://api.spotify.com/v1/tracks/' + trackId,
      type: 'GET',
      headers: {
        'Authorization': 'Bearer ' + accessToken
      },
      success: function(track) {
        console.log('Fetched track:', track.name, 'by', track.artists[0].name);
        addTrack(track);
      },
      error: function(xhr, status, error) {
        console.error('Error fetching track:', error);
      }
    });
  };

  var searchTrack = function(query) {
    $.ajax({
      url: 'https://api.spotify.com/v1/search',
      type:  'GET',
      headers: {
        'Authorization': 'Bearer ' + accessToken
      },
      data: {
        q: query,
        type: 'track'
      },
      success: function(response) {
        if (response.tracks.items.length > 0) {
          var firstTrack = response.tracks.items[0];
          console.log('Found track ', firstTrack.name, '|', firstTrack.artists[0].name);
          addTrack(firstTrack);
          songIndex = songs.length - 1;
          switchSong();
        } else {
          console.log('No tracks found...')
        }
      },
      error: function(xhr, status, error) {
        console.error('Error : ', error);
      }
    });
  };

  $('#search-button').on('click', function() {
    var query = $('#search-input').val();
    if (query.trim() !== '') {
      searchTrack(query);
    } else {
      console.log('Please enter a query')
    }
  })

  var addTrack = function(track) {
    var artistId = track.artists[0].id;

    $.ajax({
      url: 'https://api.spotify.com/v1/artists/' + artistId,
      type: 'GET',
      headers: {
        'Authorization': 'Bearer ' + accessToken
      },
      success: function(artist) {
        var newTrack = {
          title: track.name,
          artist: track.artists[0].name,
          spotifyId: track.id,
          cover: track.album.images.length > 0 ? track.album.images[0].url : 'default_cover.jpg',
          artistImage: artist.images.length > 0 ? artist.images[0].url : 'default_artist.jpg'
        };
        songs.push(newTrack);
        if (songs.length === trackIds.length) {
          initPlayer();
        }
      },
      error: function(xhr, status, error) {
        console.error('Error fetching artist details:', error);
      }
    });
  };

  var initPlayer = function() {
    maxSongIndex = songs.length - 1;
    var trackList = '';
    songs.forEach(function(song, index) {
      trackList += '<li data-index="' + index + '" class="tracks_track"><h3 class="tracks_title">' + song.title + '</h3><h4 class="tracks_artist">' + song.artist + '</h4></li>';
    });
    $(ui.tracks.list).html(trackList);
    $(ui.tracks.track).each(function() {
      trackPositions.push($(this).position().top);
    });

    $(ui.controls.play.playPause).on('click', function() {
      if (isPlaying) {
        pause();
        return;
      }
      play();
    });

    $(ui.controls.prev).on('click', function() {
      prev();
    });

    $(document).on('click', ui.tracks.track, function() {
      songIndex = $(this).data('index');
      switchSong();
    });

    $(ui.controls.next).on('click', function() {
      next();
    });

    $(ui.options.random).on('click', function() {
      $(this).toggleClass(ui.options.activeClass);
      isShuffle = !isShuffle;
    });

    $(ui.options.playlist).on('click', function() {
      $(ui.holder.holder).toggleClass(ui.holder.flippedClass);
    });

    $(ui.progressBarHolder).on('click', function(event) {
      scrub((event.pageX - $(this).offset().left) * 100 / $(this).width());
    });

    $(ui.volume.slider).on('input', function() {
      setVolume($(this).val());
    });

    setSong();
  };

  var setSong = function() {
    var currentSong = songs[songIndex];
    $(ui.info.title).html(currentSong.title);
    $(ui.info.artist).html(currentSong.artist);
    $('.player_cover').css('background-image', 'url(' + currentSong.cover + ')');
    $('.player_artist_image').attr('src', currentSong.artistImage);
    playSpotifyTrack(currentSong.spotifyId);
  };

  var playSpotifyTrack = function(spotifyId) {
    var url = 'https://api.spotify.com/v1/tracks/' + spotifyId;
    $.ajax({
      url: url,
      headers: {
        'Authorization': 'Bearer ' + accessToken
      },
      success: function(response) {
        var previewUrl = response.preview_url;
        if (previewUrl) {
          audio = new Audio(previewUrl);
          audio.onended = function() {
            next();
          };
          setVolume($(ui.volume.slider).val());
        } else {
          console.log('No preview available for the track');
        }
      },
      error: function(xhr, status, error) {
        console.error('Error fetching track from Spotify API:', error);
      }
    });
  };

  var play = function() {
    if (audio) {
      audio.play().then(() => {
        isPlaying = true;
        switchPlayPause();
      }).catch(error => {
        console.error('Error playing audio:', error);
      });
    }
  };

  var pause = function() {
    if (audio) {
      audio.pause();
    }
    isPlaying = false;
    switchPlayPause();
  };

  var prev = function() {
    history.pop();
    if (history.length) {
      songIndex = history[history.length - 1];
    } else {
      songIndex = songIndex > 0 ? songIndex - 1 : maxSongIndex;
    }
    switchSong();
  };

  var next = function() {
    if (isShuffle) {
      songIndex = getRandomInt(0, maxSongIndex, songIndex);
    } else {
      songIndex = songIndex < maxSongIndex ? songIndex + 1 : 0;
    }
    switchSong();
  };

  var switchSong = function() {
    setSong();
    saveSongAsPlayed();
  };

  var saveSongAsPlayed = function() {
    if (history[history.length - 1] !== songIndex) {
      history.push(songIndex);
    }
  };

  var switchPlayPause = function() {
    var removeClass = isPlaying ? ui.controls.play.playIconClass : ui.controls.play.pauseIconClass;
    var addClass = isPlaying ? ui.controls.play.pauseIconClass : ui.controls.play.playIconClass;
    $(ui.controls.play.playPause)
      .find('i')
      .addClass(addClass)
      .removeClass(removeClass);
  };

  var setVolume = function(volume) {
    if (audio) {
      audio.volume = volume / 100;
    }
  };

  var scrub = function(percentageOfTheSong) {
  };

  return {
    init: function() {
      getAccessToken();
    }
  };
}();

Player.init();

