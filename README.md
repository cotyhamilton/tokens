# tokens

Toy password manager using the web crypto api in deno to learn about encryption

I was coached by an AI, don't use this :D

## Install

```sh
deno install --name tokens -A --unstable mod.ts
```

## Usage

On first run, you'll be asked for a password, a key will be created and
encrypted with this password.

Every subsequent run will ask for that password to decrypt the key used for
encrypting and decrypting the tokens.

```sh
tokens list # list name of saved tokens
tokens add github githubpassword # add a token with name github, value githubpassword (githubpassword will be encrypted)
tokens github # get the value of the github token (githubpassword)
tokens delete github # delete the github token
tokens update github githubpassword123 # update the github token to githubpassword123
```
