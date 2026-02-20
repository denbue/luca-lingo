# Luca Lingo

A personal dictionary app built with React + Vite, backed by a PocketBase database.


## Database (PocketBase)

The app uses a public PocketBase instance at `VITE_PB_URL`. The database is currently **read-only** for anonymous users — anyone can read entries, but writes are blocked server-side.

### How it works

In the PocketBase admin UI, for each collection (`dictionaries`, `dictionary_entries`, `definitions`, `dictionary_translations`, `entry_translations`, `definition_translations`):

| Rule | Setting |
|------|---------|
| List / View | `""` (public) |
| Create / Update / Delete | locked (superadmin only) |

### Re-enabling writes

To allow the admin feature in the app to write again, go to the PocketBase admin panel → each collection → **API Rules** and unlock Create/Update/Delete (set to `""` for public, or scope to a specific auth rule).
