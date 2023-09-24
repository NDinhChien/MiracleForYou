<h2 align="center">MiracleForYou</h3>
### A RESTful API of standard routes built with good architecture using ExpressJs

## Table of Contents

- [Introduction](#intro)
- [About this project](#about)
- [What i have learned](#learn)
- [Routes](#routes)
- [Tests](#tests)
- [Thank you](#thanks)
- [Next plan](#plan)

## Introduction <a name = "intro"></a>

I am sending my many thanks to Mr. janishar. It has been so kind of him to share his works with our community of developers.
Specifically, his repository named [Node.js Backend Architecture Typescript Project](https://github.com/janishar/nodejs-backend-architecture-typescript) - a popular public repository that offers a nice architecture for building independent, scalable and maintainable **RESTful API** with ExpressJs
I have learn a lot from his project. It took me more than 2 months to go from reading, trying to understand, and finally be able to use his codebase as references to write my first professional API. 
Although it has been overwhelming since i had lots of things to learn and get familar with. But generally, i am satisfied with my learning progress, considering this is my first time challenging myself with a real-life application and it will definitely help me a lot in getting a job as an backend developer.
I also made some **improvements** from his codebase hopefully 🤗. So i think people can learn something new from this repository as well!

## About this project <a name = "about"></a>

I tried to build some standard features of an backend application with nice buniness rules applied.

## What i have learned? <a name = "learn"></a>

By building the app step-by-step helps me, I have learned:

- Tools and technologies that are actually used in professional environment.
- Get better understanding of workflows in software development.
- How all the aspects of an typical backend application fit together.

Now, i feel confident to develop and maintain more intersting features as well as writing automatic tests for them!

### Backend architecture with ExpressJs

In my opinon, the following are best characteristics of this architecture
* **Written in Typescript:** Most errors are caught at build time, allow us to write readable and bug-free code
* **Feature encapsulation:** Files or components related to a particular feature are grouped in one, make it is easier for maintaining, scaling our app, as well as writing tests
* **Centralizing error handling and response handling**
* **Async execution:** Using async/await version of necessary middlewares and functions, using Async Handler to make sure both caught and uncaught errors to be handled properly

### Technologies and tools

1. **ExpressJs:** As backend framework
2. **MongoDB:** Learn to design schemas and good practices of using MongoDB indexes and queries
3. **Redis:** Use list and sorted set specifically
4. **JsonWebToken:** For user authentication  
5. **Jest:** For writing unit test and integration test
6. **Joi:** For validating user requests
7. **Multer:** For handling file upload to server 
8. **Winston:** For logging
9. **Prettier & Eslint:** Use both to format and style codebase
10. **Docker:** For dockerize our app (I haven't tried to create my app image and build container yet)
11. **Setups and configs:** TSC, VSCODE tasks for checking entire project errors, Jest, Eslint & Prettier.

## Routes <a name = "routes"></a>

Here is the list of routes implemented

### Some standard features
**Access related**
<span class='post'>POST</span>   /login
<span class='post'>POST</span>   /signup
<span class='delete'>DELETE</span> /logout
<span class='post'>POST</span>   /token/refresh

**Credential related**
<span class='put'>PUT</span>  /email/refresh
<span class='post'>POST</span> /email/verify
<span class='post'>POST</span> /password/reset
<span class='put'>PUT</span>  /password

**Profile related**
<span class='put'>PUT</span>  /profile/
<span class='put'>PUT</span>  /profile/name
<span class='put'>PUT</span>  /profile/avatar
<span class='get'>GET</span>  /profile/my
<span class='get'>GET</span>  /profile/id/:id

**Search users for admin users only**
<span class='get'>GET</span>  /users/search/name?like=
<span class='get'>GET</span>  /users/all?page=0&limit=4
<span class='get'>GET</span>  /users/id/:id

### Main features
I have also add routes for users to send private messages to each others. Since i didn't implement full-duplex connections, users have to send requests for new messages themselves.
**In addition**, users can send to world messages, where everyone can read from, but they have to call requests to get latest messages or messages after or before a specific timestamps.
These features are built using Redis list for private messages and sorted set for world messages.

<style>
span {
  display: inline-block;
  width: 70px;
}
.post {
  color: orange;
}
.put {
  color: blue;
}
.get {
  color: green;
}
.delete {
  color: red;
}
</style>


**World messages**
<span class='get'>GET</span>  /message/world/latest
<span class='get'>GET</span>  /message/world/after?date
<span class='get'>GET</span>  /message/world/before?date
<span class='post'>POST</span> /message/world

**Private messages**
<span class='get'>GET</span>  /message
<span class='post'>POST</span> /message/id/:id

## Tests <a name = "tests"></a>

To test this application, I used [Jest](https://jestjs.io/) framework to write unit tests and integration tests for most outstanding features:

### Validation 

**POST /login - validation**
    ✔️ if there is no email, it should throw 'email is required' (69 ms)
    ✔️ if there is no password, it should throw 'password is required' (24 ms)
    ✔️ if there is unneeded fields, it should throw 'field is not allowed' (30 ms)
    ✔️ if password is shorter than 6 characters, it should throw 'at least 6 characters long' (23 ms)
    ✔️ if password is longer than 30 characters, it should throw 'less than or equal to 30 characters long' (23 ms)
    ✔️ if password contains special characters not included in [\$#@&%], it should throw 'can only contain ...' (19 ms)
    ✔️ if email has invalid form, it should throw 'not a valid email' (19 ms)
    ✔️ if email is valid and password contains special characters included in [\$#@&%], validation should be successful (20 ms)
    ✔️ if email is valid and password contain alphanumeric characters, validation should be successfull (22 ms)
  /login - login unit test
    ✔️ if there is no user exists, it should throw 'does not exist' (22 ms)
    ✔️ if there is one whose status is false, it should throw 'currently invalid' (23 ms)
    ✔️ if there is valid one and you login the first time with wrong password, it should inform 'Invalid password - 2 times left to tr
y (112 ms)
    ✔️ if you enter the wrong password again, it should response 'Invalid password - 1 times left to try' (151 ms)
    ✔️ if you enter the wrong password another time, it should response 'Invalid password - 0 times left to try' (110 ms)
    ✔️ if you still login with wrong password, it should inform 'maximum try time' (19 ms)
    ✔️ if you enter the right password, you should receive your user info and tokens respectively (138 ms)

**authentication - validation**
    ✔️ if there is no authorization header, it should throw 'authorization is required' (23 ms)
    ✔️ if authorization hearder does not start with 'Bearer ', it should throw 'must be like Bearer <token>' (22 ms)
    ✔️ if the authorization header starts with 'Bearer ' but not have token string, it should throw 'must be like Bearer <token>' (23ms)
    ✔️ if the authorization header is valid, it should be validated successfully (20 ms)


### Unit tests

**Json Web Token - unit test**
    ✔️ if a token created by encoding an unexpired payload, then both decoding and validating that token will give the original payload (40 ms)
    ✔️ if a token created by encoding an expired payload, then decoding that token will give the original payload but validating should throw error (10 ms)
    ✔️ if a token created from a different private key, then both decoding and validing should throw errors (18 ms)

**authentication - unit test**
    ✔️ if the access token is invalid, it should throw 'token is not valid' (56 ms)
    ✔️ if the access token is expired, it should throw 'token is expired' (31 ms)
    ✔️ if the payload has any invalid field, it should throw 'invalid access token' (19 ms)
    ✔️ if there is no key associated with sub field in keys collection, it should throw 'key does not exist' (22 ms)
    ✔️ if the access key is valid, user should be authenticated successfully (24 ms)

**authorization - unit test**
    ✔️ if required roles are invalid, it should throw 'internall error' (163 ms)
    ✔️ if user don't have any of required roles, it should throw 'permission deny' (51 ms)
    ✔️ if user have any of required roles, user should be authorized successfully (25 ms)

### Integration tests

  ✔️ admin, user1 and user2 login with right passwords, it should be all successfull (9228 ms)

**ALL /message - private message - integration test**
    ✔️ admin send a message to user1, it should be sucessfull (1134 ms)
    ✔️ user2 send a message to user1, it should be sucessfull (1081 ms)
    ✔️ if user1 try to get new messages, there should be two message from user2 and admin (1074 ms)
    ✔️ if user1 check new messages again, it should be empty (1091 ms)

**ALL /message/world - world message - integration test**
    ✔️ admin sends 2 messages to the world successfully (3238 ms)
    ✔️ user1 sends 2 messages to the world successfully (3656 ms)
    ✔️ user2 sends 2 messages to the world successfully (3913 ms)
    ✔️ if user tries to get latest messages, he/she should receive msg#5 and msg#6 (540 ms)
    ✔️ if user tries to get messages before the time bf_5, he/she should receive msg#3 and msg#4 (781 ms)
    ✔️ if user tries to get messages before the time bf_4, he/she should receive msg#2 and msg#3 (789 ms)
    ✔️ if user tries to get messages before the time bf_3, he/she should receive msg#2 only, since msg#1 has been removed (777 ms)
    ✔️ if user tries to get messages before the time bf_2, he/she should receive empty [] (537 ms)
    ✔️ if user tries to get messages after the time bf_2, he/she should receive msg#2 and msg#3 (544 ms)
    ✔️ if user tries to get messages after the time bf_3, he/she should receive msg#3 and msg#4 (538 ms)
    ✔️ if user tries to get messages after the time bf_5, he/she should receive msg#5 and msg#6 (586 ms)
    ✔️ if user tries to get messages after the time bf_6, he/she should receive msg#6 only (550 ms)
    ✔️ if user tries to get messages after now, he/she should receive empty [] (526 ms)

**PUT /profile/name - name update - integration test**
    ✔️ if user changes name for the first time, user should be allowed to. If the new name is already existed, it should throw 'already existed' (4697 ms)
    ✔️ if the new name is the same as current name, it should throw 'your current name' (844 ms)
    ✔️ if the new name is not owned by anyone yet, it should be successful (1388 ms)
    ✔️ if user name has been updated recently, it should throw 'can only update name after' (824 ms)
    ✔️ if the last time user changed name is a long time ago (over renew duration), user should be allowed to (1651 ms)

**POST /login - integration test**
    ✔️ if there is no user exists, it should throw 'user does not exist' (380 ms)
    ✔️ if there is one whose status is false, it should throw 'currently invalid user' (1171 ms)
    ✔️ if there is valid one and you login the first time with wrong password, it should throw 'Invalid password - 2 times left to try (1569 ms)
    ✔️ if you enter the wrong password again, it should throw 'Invalid password - 1 times left to try' (1181 ms)
    ✔️ if you enter the wrong password another time, it should throw 'Invalid password - 0 times left to try' (1284 ms)
    ✔️ if you still login with wrong password, it should throw 'maximum try time' (802 ms)
    ✔️ if it has been a long time since your last login attempt (over RENEW_DURATION), it should reset try times(1509 ms)
    ✔️ if you enter the right password, you should receive your user info and tokens respectively (1989 ms)

**POST /signup - integration test**
    ✔️ if email is not registered and has not been verified yet, it should throw 'verify email first' (626 ms)
    ✔️ if email is not registered and has been verified for over VALID_IN so far, it should throw 'verify email again'  (893 ms)
    ✔️ if email is not registered and has been just verified recently, then registration should be successfull (2362 ms)
    ✔️ if email has already registered, it should throw 'user has already existed (317 ms)

**PUT /email/refresh - integration test**
    ✔️ if there is no record associated with the email in emailCodes collection, it should issue an email code (1120 ms)
    ✔️ if there is one, but has already been verified recently (not over IN_VALID time), it shoud throw 'verified recently' (890 ms)
    ✔️ if there is one, but has been verified for a while (over IN_VALID time), it should issue a new email code and reset refresh time (849 ms)
    ✔️ if there is an unverified one, and you ask to refresh the first time, it should issue a new email code
   (880 ms)
    ✔️ if you ask to refresh the last time, it should issue a new email code with message 'the last time' (571 ms)
    ✔️ if you still try to refresh other more times, it should warn 'maximum refresh time' (339 ms)
    ✔️ if there is an unverified one, but it has been over RENEW_DURATION time since the last try, then it should issue a new email code and reset refresh time (871 ms)

**PUT /email/verify - integration test**
    ✔️ if there is no record associated with the email in emailCodes collection, it should throw 'no code available' (585 ms)
    ✔️ if there is one and you try to verify over ENTER_IN time, it should throw 'code expired' (774 ms)
    ✔️ if there is one, and you try to verify in ENTER_IN time with the right code, verification should be successfull' (848 ms)
    ✔️ if the email has been verified in VALID_IN time and you try to verify again, it should throw 'already verified' (328 ms)
    ✔️ if the email has been verified for a while, it should throw 'verification expired, refresh new code and verify again' (592 ms)
    ✔️ if there is an one, and you try to verify in ENTER_IN time with wrong code, it should throw 'wrong code' (901 ms)
    ✔️ if you keep enter the wrong code in ENTER_IN time, and this is the last time you can try,
  it shoud throw 'wrong code' and suggest to refresh new code (599 ms)
    ✔️ if you still try to verify other more times, it should warn 'maximum try time' (324 ms)


## Thank you! <a name = "thanks"></a>

It might be considered **best strategy** to learn from a real-life application and it is so helpful to have runnable codebase as references, especially during our early time with new technologies. For example, you don't have to deal with all the database and cache connection setups that will cost you lots of time finding best practices.
Finally, when you read this post, i am quite sure that you got stumbled for times over my writing skill 😅. To be honest, I am not really good at it and has been paying litte practices into it, but i hope you can understand what i meant. Thank you for your visit and God bless you all !

## Next plan? <a name = "plan"></a>

My next plan is to build an API using NestJS + SocketIO + MongoDB + PassportJS, hopefully it will learn much about these stack of technologies. I also want to practice OPP design patterns & apply SOLID principles as well!