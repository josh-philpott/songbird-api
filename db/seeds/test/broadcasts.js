exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('broadcast')
    .del()
    .then(function() {
      // Inserts seed entries
      return knex('broadcast').insert([
        {
          id: 1246738839,
          broadcasterName: 'Josh Philpott',
          profileImageUrl:
            'https://scontent.xx.fbcdn.net/v/t1.0-1/p320x320/33748780_10155366585941366_7866216603870822400_n.jpg?_nc_cat=111&_nc_ohc=-G_bfF4TqVgAQnH5fP32Jve9Ogw51iCxWO--KVm6Mx1UDND0L5G2wto_A&_nc_ht=scontent.xx&oh=4f0ed624d32db6a662a93a71a3f8ed74&oe=5E6628C4',
          socketId: '4sqwGzWBxAuLu_bvAAAN',
          isBroadcasterConnected: true,
          currentlyPlaying: {
            timestamp: 1576001719412,
            context: {
              external_urls: {
                spotify:
                  'https://open.spotify.com/playlist/37i9dQZF1E8Ha8E8b07pBz'
              },
              href:
                'https://api.spotify.com/v1/playlists/37i9dQZF1E8Ha8E8b07pBz',
              type: 'playlist',
              uri: 'spotify:user:spotify:playlist:37i9dQZF1E8Ha8E8b07pBz'
            },
            progress_ms: 51275,
            item: {
              album: {
                album_type: 'single',
                artists: [
                  {
                    external_urls: {
                      spotify:
                        'https://open.spotify.com/artist/3YQKmKGau1PzlVlkL1iodx'
                    },
                    href:
                      'https://api.spotify.com/v1/artists/3YQKmKGau1PzlVlkL1iodx',
                    id: '3YQKmKGau1PzlVlkL1iodx',
                    name: 'Twenty One Pilots',
                    type: 'artist',
                    uri: 'spotify:artist:3YQKmKGau1PzlVlkL1iodx'
                  }
                ],
                available_markets: ['US'],
                disc_number: 1,
                duration_ms: 238866,
                explicit: false,
                external_ids: { isrc: 'USAT21903522' },
                external_urls: {
                  spotify:
                    'https://open.spotify.com/track/4hhc1rMxhTFbTRf9gCFgyR'
                },
                href:
                  'https://api.spotify.com/v1/tracks/4hhc1rMxhTFbTRf9gCFgyR',
                id: '4hhc1rMxhTFbTRf9gCFgyR',
                is_local: false,
                name: 'Chlorine (Mexico City)',
                popularity: 63,
                preview_url:
                  'https://p.scdn.co/mp3-preview/f213686b0084c6c74c863f2a05b4c71c135f78a2?cid=b272fc29d92a4976b7e672079986f602',
                track_number: 1,
                type: 'track',
                uri: 'spotify:track:4hhc1rMxhTFbTRf9gCFgyR'
              },
              currently_playing_type: 'track',
              actions: { disallows: { resuming: true } },
              is_playing: true
            }
          },
          isBroadcasting: true
        }
      ])
    })
}
