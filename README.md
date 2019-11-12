# Poker stats service



# prerequisites
* node installed (version 8 or higher) - https://nodejs.org/en/download/


# Description
* this repo is for the server-side, but also contain an example client (FrontEnd written in REACT)

* in order to run the server locally, you should first run the `npm install` once to have all the dependencies installed, and then run the start script (`npm run start`)

* once you start the server, if there are no errors, you can start sending requests to the server.
   you can either use the browser, or a tool like curl or postman

* to see the server API, you can look at the swagger file(./api/swagger/swagger.yaml),
OR, if the server is up you can go to http://localhost:5000/swagger on your browser

each endpoint there will have the method (GET/POST/PATCH/DELETE), the endpoint address, and the paramerters you'll need to use it

for example, most api calls will require 2 headers:
`x-auth-token` and `provider`

this 2 headers are needed to authenticate the request per user, (see section on the test-client ahead for more info)


# test - client


