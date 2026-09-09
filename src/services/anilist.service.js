import axios from "axios";

const ANILIST_GRAPHQL_URL = "https://graphql.anilist.co";

/**
 * Executes an AniList GraphQL query/mutation
 */
async function queryAniList(query, variables = {}, token = null) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await axios.post(
    ANILIST_GRAPHQL_URL,
    { query, variables },
    { headers }
  );

  if (response.data.errors) {
    const errorMsg = response.data.errors.map((e) => e.message).join(", ");
    throw new Error(errorMsg || "AniList GraphQL error");
  }

  return response.data.data;
}

/**
 * Fetch authenticated viewer info
 */
export async function fetchCurrentViewer(token) {
  if (!token) return null;

  const query = `
    query {
      Viewer {
        id
        name
        avatar {
          large
          medium
        }
        bannerImage
        statistics {
          anime {
            count
            meanScore
            minutesWatched
            episodesWatched
          }
        }
      }
    }
  `;

  const data = await queryAniList(query, {}, token);
  return data?.Viewer || null;
}

/**
 * Fetch user anime lists by username or userId
 */
export async function fetchAniListUserAnime(usernameOrId, token = null) {
  const isNumeric = /^\d+$/.test(String(usernameOrId).trim());
  const variables = {};
  if (isNumeric) {
    variables.userId = parseInt(usernameOrId, 10);
  } else {
    variables.userName = String(usernameOrId).trim();
  }

  const query = `
    query ($userName: String, $userId: Int) {
      MediaListCollection(userName: $userName, userId: $userId, type: ANIME) {
        lists {
          name
          isCustomList
          status
          entries {
            id
            mediaId
            status
            score
            progress
            repeat
            updatedAt
            media {
              id
              idMal
              title {
                romaji
                english
                native
              }
              coverImage {
                large
                extraLarge
              }
              bannerImage
              episodes
              format
              status
              genres
              averageScore
              seasonYear
            }
          }
        }
        user {
          id
          name
          avatar {
            large
            medium
          }
          bannerImage
          statistics {
            anime {
              count
              meanScore
              minutesWatched
              episodesWatched
            }
          }
        }
      }
    }
  `;

  const data = await queryAniList(query, variables, token);
  return data?.MediaListCollection || null;
}

/**
 * Update episode progress on AniList for a media item
 */
export async function updateAniListProgress(token, mediaId, progress) {
  if (!token || !mediaId) return null;

  const query = `
    mutation ($mediaId: Int, $progress: Int) {
      SaveMediaListEntry(mediaId: $mediaId, progress: $progress) {
        id
        mediaId
        progress
        status
      }
    }
  `;

  const data = await queryAniList(query, { mediaId, progress }, token);
  return data?.SaveMediaListEntry || null;
}
