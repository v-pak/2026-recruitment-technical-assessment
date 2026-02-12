> This question is relevant for **chaos backend**

# DevSoc Subcommittee Recruitment: Chaos Backend

***Complete as many questions as you can.***

## Question 1
You have been given a skeleton function `process_data` in the `data.rs` file.
Complete the parameters and body of the function so that given a JSON request of the form

```json
{
  "data": ["Hello", 1, 5, "World", "!"]
}
```

the handler returns the following JSON:
```json
{
  "string_len": 11,
  "int_sum": 6
}
```

Edit the `DataResponse` and `DataRequest` structs as you need.

## Question 2

### a)
Write SQL (Postgres) `CREATE` statements to create the following schema. Be sure to include foreign keys to appropriately model the relationships and, if appropriate, make relevant tables `CASCADE` upon deletion. You may enrich the tables with additional columns should you wish. To help you answer the question, a simple diagram is provided. 
![Database Schema](db_schema.png)

**Answer box:**
```sql
-- My interpretation of the diagram:
-- 1a. If a playlist is deleted, all playlist_songs referencing the playlist are deleted
-- 1b.Likewise, if a user is deleted, all their playlists are also deleted
-- 1c. Or if a song is deleted, all rows in playlist songs containing that song id are deleted
-- 2. The line linking user_id indicates that playlists.user_id is nullable, while the other two links are mandatory
-- 3a. A wrench indicates a key to be primary
-- 3b. A chainlink indicates a key to be foreign


-- Arguably IDs should be BIGINTs but that wasn't specified in the schema, so I
-- stuck to using standard INTEGERs
CREATE Users (
  id INTEGER PRIMARY KEY
);

CREATE songs (
  id INTEGER PRIMARY KEY,
  title TEXT,
  artist TEXT,
  duration INTERVAL -- my syntax highlighting isn't working here, but PostgreSQL documents this as being a valid type
)

CREATE playlists (
  id INTEGER PRIMARY KEY,
  user_id INTEGER -- nullable, since there is a circle
    REFERENCES Users(id),
    ON DELETE SET NULL-- nulling since a playlist can comfortably exist without a creator
  name TEXT
)

CREATE playlist_songs (
  playlist_id INTEGER
    REFERENCES playlists(id)
    ON DELETE CASCADE,
  song_id INTEGER
    REFERENCES songs(id)
    ON DELETE CASCADE,
  PRIMARY KEY (playlist_id, song_id)
)
```

### b)
Using the above schema, write an SQL `SELECT` query to return all songs in a playlist in the following format, given the playlist id `676767`
```
| id  | playlist_id | title                                      | artist      | duration |
| --- | ----------- | ------------------------------------------ | ----------- | -------- |
| 4   | 676767      | Undone - The Sweater Song                  | Weezer      | 00:05:06 |
| 12  | 676767      | She Wants To Dance With Me - 2023 Remaster | Rick Astley | 00:03:18 |
| 53  | 676767      | Music                                      | underscores | 00:03:27 |
```

**Answer box:**
```sql
SELECT songs_id as id, playlist_id, title artist, duration 
FROM playlist_songs ps JOIN songs s ON ps.song_id = s.id
WHERE playlist_id = 676767
```