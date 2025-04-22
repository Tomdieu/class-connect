
- clone repo

- copy env

- generate password
```sh
./gen-passwords.sh
```
- creates a directory structure for Jitsi configuration files in the user's home directory.
```sh
mkdir -p ~/.jitsi-meet-cfg/{web,transcripts,prosody/config,prosody/prosody-plugins-custom,jicofo,jvb,jigasi,jibri}
```

- run 

```
docker compose -f docker-compose.yml -f whiteboard.yml -f jibri.yml up -d
```