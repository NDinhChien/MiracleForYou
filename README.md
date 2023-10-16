<h2 align="center">Backend Architecture With Express JS</h2>
  
<h3 align="center">A typical RESTful API with scalable architecture powered by ExpressJs </h3>
  
##  Table of Contents
  
- [Introduction](#intro )
- [About this project](#about )
- [What i have learned](#learn )
- [Routes](#routes )
- [Tests](#tests )
- [Thank you](#thanks )
- [Next plan](#plan )
  
##  Introduction <a name = "intro"></a>
  
I want to say thank you to Mr. janishar. It has been so kind of him to share his works with our community of developers.
Specifically, his repository named [Node.js Backend Architecture Typescript Project](https://github.com/janishar/nodejs-backend-architecture-typescript ) - a popular public repository that offers a nice architecture for building independent, scalable and maintainable **RESTful API** with ExpressJs
I have learn a lot from his project. It took me quite a long time to go from reading, try to understand, and finally to use his codebase as references to write my first professional looking API. 
Although it has been overwhelming because i had lots of things to learn and get familar with. But generally, i am satisfied with my learning progress, considering this is my first time challenging myself with a real-life application and it will definitely help me a lot on my carrer path as an backend developer.
I also made some **improvements** from his codebase hopefully. So i think people can learn something new from this repository as well 🤗!
  
##  About this project <a name = "about"></a>
  
I tried to build some standard usecases of an backend application with nice buniness rules applied.
  
##  What i have learned? <a name = "learn"></a>
  
By building the app step-by-step helps me, I have learned:
  
- Tools and technologies that are actually used in professional environment.
- Get better understanding of workflows in software development.
- Core aspects of an typical backend application.
  
Now, i feel confident to develop and maintain more intersting features as well as writing automatic tests for them!
  
###  Backend architecture with ExpressJs
  
In my opinon, the following are best characteristics of this architecture
* **Written in Typescript:** Along with the help of VSCode intellisence, most errors are caught at build time, allow us to write readable and less bug-prone code
* **Feature encapsulation:** Files related to a particular feature are grouped in one, make it is easier for maintaining, scaling our app, as well as writing tests
* **Centralizing error handling and response handling**
* **Async execution:** Using async/await version of necessary middlewares and functions and Async Handler to make sure both caught and uncaught errors to be handled properly
  
###  Technologies and tools
  
1. **ExpressJs:** As backend framework
2. **MongoDB:** Learn to design schemas and good practices of using MongoDB indexes and queries
3. **Redis:** Use list and sorted set specifically
4. **JsonWebToken:** For user authentication  
5. **Jest:** For writing unit test and integration test
6. **Joi:** For validating user requests
7. **Multer:** For handling file upload to server 
8. **Winston:** For logging
9. **Prettier & Eslint:** Use both to format and style codebase
10. **Docker:** For dockerizing our app (I haven't tried to create my app image and build container yet)
  
##  Routes <a name = "routes"></a>
  
Here is the list of routes implemented:
  
###  Some standard features
**Auth related**\
**POST**&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/login\
**POST**&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/signup\
**DELETE** &nbsp;&nbsp;/logout\
**POST** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/token/refresh
  
**Credential related**\
**PUT** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/email/refresh\
**POST** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/email/verify\
**POST** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/password/reset\
**PUT** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/password
  
**Profile related**\
**PUT** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/profile/\
**PUT** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/profile/name\
**PUT** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/profile/avatar\
**GET** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/profile/my\
**GET** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/profile/id/:id
  
**Search users for admin users only**\
**GET** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/users/search/name?like=\
**GET** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/users/all?page=0&limit=4\
**GET** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/users/id/:id
  
###  Main features
  
I have also add routes for users to send private messages to each others. Since i didn't implement full-duplex connections, users have to send requests for new messages manually.
**In addition**, users can send to world messages, where everyone can read from, they can requests for latest messages or messages after or before a specific timestamp.
These features are built using **Redis list** for private messages and **Redis sorted set** for world messages.
  
**World messages**\
**GET** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/message/world/latest\
**GET** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/message/world/after?date\
**GET** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/message/world/before?date\
**POST** &nbsp;&nbsp;&nbsp;&nbsp;/message/world
  
**Private messages**\
**GET** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/message\
**POST** &nbsp;&nbsp;&nbsp;&nbsp;/message/id/:id


##  Tests <a name = "tests"></a>
  
To test this application, I used [Jest](https://jestjs.io/ ) framework to write unit tests and integration tests for most outstanding features:
  
###  Validation 
  
**POST /login - validation**\
    ✔️ When there is no email, it should error 'email is required' (69 ms)\
    ✔️ When there is no password, it should error 'password is required' (24 ms)\
    ✔️ When there is unneeded fields, it should error 'field is not allowed' (30 ms)\
    ✔️ When password is shorter than 6 characters, it should error 'at least 6 characters long' (23 ms)\
    ✔️ When password is longer than 30 characters, it should error 'less than or equal to 30 characters long' (23 ms)\
    ✔️ When password contains special characters not included in [\$#@&%], it should error 'can only contain ...' (19 ms)\
    ✔️ When email has invalid form, it should error 'not a valid email' (19 ms)\
    ✔️ When email is valid and password contains special characters included in [\$#@&%], validation should be successful (20 ms)\
    ✔️ When email is valid and password contain alphanumeric characters, validation should be successfull (22 ms)\
  /login - login unit test
    ✔️ When there is no user exists, it should error 'does not exist' (22 ms)\
    ✔️ When there is one whose status is false, it should error 'currently invalid' (23 ms)\
    ✔️ When there is valid one and you login the first time with wrong password, it should error 'Invalid password - 2 times left to tr
y (112 ms)\
    ✔️ When you enter the wrong password again, it should error 'Invalid password - 1 times left to try' (151 ms)\
    ✔️ When you enter the wrong password another time, it should error 'Invalid password - 0 times left to try' (110 ms)\
    ✔️ When you still login with wrong password, it should error 'maximum try time' (19 ms)\
    ✔️ When you enter the right password, you should receive your user info and tokens respectively (138 ms)
  
**authentication - validation**\
    ✔️ When there is no authorization header, it should error 'authorization is required' (23 ms)\
    ✔️ When authorization hearder does not start with 'Bearer ', it should error 'must be like Bearer <token>' (22 ms)\
    ✔️ When the authorization header starts with 'Bearer ' but not have token string, it should error 'must be like Bearer <token>' (23ms)\
    ✔️ When the authorization header is valid, validation should be successfull (20 ms)
  
  
###  Unit tests
  
  
**Json Web Token - unit test**\
    ✔️ When a token created by encoding an unexpired payload, then both decoding and validating that token will give the original payload (40 ms)\
    ✔️ When a token created by encoding an expired payload, then decoding that token will give the original payload but validating should throw error (10 ms)\
    ✔️ When a token created from a different private key, then both decoding and validing should throw errors (18 ms)
  
**authentication - unit test**\
    ✔️ When the access token is invalid, it should error 'token is not valid' (56 ms)\
    ✔️ When the access token is expired, it should error 'token is expired' (31 ms)\
    ✔️ When the payload has any invalid field, it should error 'invalid access token' (19 ms)\
    ✔️ When there is no key associated with sub field in keys collection, it should error 'key does not exist' (22 ms)\
    ✔️ When the access key is valid, user should be authenticated successfully (24 ms)
  
**authorization - unit test**\
    ✔️ When required roles are invalid, it should error 'internall error' (163 ms)\
    ✔️ When user don't have any of required roles, it should error 'permission deny' (51 ms)\
    ✔️ When user have any of required roles, user should be authorized successfully (25 ms)
  
###  Integration tests
  
  
  ✔️ admin, user1 and user2 login with right passwords, it should be all successfull (9228 ms)
  
**ALL /message - private message - integration test**\
    ✔️ admin send a message to user1, it should be sucessfull (1134 ms)\
    ✔️ user2 send a message to user1, it should be sucessfull (1081 ms)\
    ✔️ When user1 try to get new messages, there should be two message from user2 and admin (1074 ms)\
    ✔️ When user1 check new messages again, it should be empty (1091 ms)
  
**ALL /message/world - world message - integration test**\
    ✔️ admin sends 2 messages to the world successfully (3238 ms)\
    ✔️ user1 sends 2 messages to the world successfully (3656 ms)\
    ✔️ user2 sends 2 messages to the world successfully (3913 ms)\
    ✔️ When user tries to get latest messages, he/she should receive msg#5 and msg#6 (540 ms)\
    ✔️ When user tries to get messages before the time bf_5, he/she should receive msg#3 and msg#4 (781 ms)\
    ✔️ When user tries to get messages before the time bf_4, he/she should receive msg#2 and msg#3 (789 ms)\
    ✔️ When user tries to get messages before the time bf_3, he/she should receive msg#2 only, since msg#1 has been removed (777 ms)\
    ✔️ When user tries to get messages before the time bf_2, he/she should receive empty [] (537 ms)\
    ✔️ When user tries to get messages after the time bf_2, he/she should receive msg#2 and msg#3 (544 ms)\
    ✔️ When user tries to get messages after the time bf_3, he/she should receive msg#3 and msg#4 (538 ms)\
    ✔️ When user tries to get messages after the time bf_5, he/she should receive msg#5 and msg#6 (586 ms)\
    ✔️ When user tries to get messages after the time bf_6, he/she should receive msg#6 only (550 ms)\
    ✔️ When user tries to get messages after now, he/she should receive empty [] (526 ms)
  
**PUT /profile/name - name update - integration test**\
    ✔️ When user changes name for the first time, user should be allowed to. When the new name is already existed, it should error 'already existed' (4697 ms)\
    ✔️ When the new name is the same as current name, it should error 'your current name' (844 ms)\
    ✔️ When the new name is not owned by anyone yet, it should be successful (1388 ms)\
    ✔️ When user name has been updated recently, it should error 'can only update name after' (824 ms)\
    ✔️ When the last time user changed name is a long time ago (over renew duration), user should be allowed to (1651 ms)
  
**POST /login - integration test**\
    ✔️ When there is no user exists, it should error 'user does not exist' (380 ms)\
    ✔️ When there is one whose status is false, it should error 'currently invalid user' (1171 ms)\
    ✔️ When there is valid one and you login the first time with wrong password, it should error 'Invalid password - 2 times left to try (1569 ms)\
    ✔️ When you enter the wrong password again, it should error 'Invalid password - 1 times left to try' (1181 ms)\
    ✔️ When you enter the wrong password another time, it should error 'Invalid password - 0 times left to try' (1284 ms)\
    ✔️ When you still login with wrong password, it should error 'maximum try time' (802 ms)\
    ✔️ When it has been a long time since your last login attempt (over RENEW_DURATION), it should reset try times(1509 ms)\
    ✔️ When you enter the right password, you should receive your user info and tokens respectively (1989 ms)
  
**POST /signup - integration test**\
    ✔️ When email is not registered and has not been verified yet, it should error 'verify email first' (626 ms)\
    ✔️ When email is not registered and has been verified for over VALID_IN so far, it should error 'verify email again'  (893 ms)\
    ✔️ When email is not registered and has been just verified recently, then registration should be successfull (2362 ms)\
    ✔️ When email has already registered, it should error 'user has already existed (317 ms)
  
**PUT /email/refresh - integration test**\
    ✔️ When there is no record associated with the email in emailCodes collection, it should issue an email code (1120 ms)\
    ✔️ When there is one, but has already been verified recently (not over IN_VALID time), it should error 'verified recently' (890 ms)\
    ✔️ When there is one, but has been verified for a while (over IN_VALID time), it should issue a new email code and reset refresh time (849 ms)\
    ✔️ When there is an unverified one, and you ask to refresh the first time, it should issue a new email code
   (880 ms)\
    ✔️ When you ask to refresh the last time, it should issue a new email code with message 'the last time' (571 ms)\
    ✔️ When you still try to refresh other more times, it should error 'maximum refresh time' (339 ms)\
    ✔️ When there is an unverified one, but it has been over RENEW_DURATION time since the last try, then it should issue a new email code and reset refresh time (871 ms)
  
**PUT /email/verify - integration test**\
    ✔️ When there is no record associated with the email in emailCodes collection, it should error 'no code available' (585 ms)\
    ✔️ When there is one and you try to verify over ENTER_IN time, it should error 'code expired' (774 ms)\
    ✔️ When there is one, and you try to verify in ENTER_IN time with the right code, verification should be successfull' (848 ms)\
    ✔️ When the email has been verified in VALID_IN time and you try to verify again, it should error 'already verified' (328 ms)\
    ✔️ When the email has been verified for a while, it should error 'verification expired, refresh new code and verify again' (592 ms)\
    ✔️ When there is an one, and you try to verify in ENTER_IN time with wrong code, it should error 'wrong code' (901 ms)\
    ✔️ When you keep enter the wrong code in ENTER_IN time, and this is the last time you can try,
  it should error 'wrong code' and suggest to refresh new code (599 ms)\
    ✔️ When you still try to verify other more times, it should error 'maximum try time' (324 ms)
  
  
##  Thank you! <a name = "thanks"></a>
  
It might be considered **best strategy** to learn from a real-life application and it is so helpful to have runnable codebase as references, especially during our early time with new technologies. For example, you don't have to deal with all the database and cache connection setups that will cost you lots of time finding best practices.
Finally, when you read this post, i am quite sure that you got stumbled many times over my writing skill 😅. To be honest, I am not really good at it but i hope you can understand what i meant. Thank you for your visit and have a good day!
  
##  Next plan <a name = "plan"></a>
  
My next plan is to build an API using NestJS + SocketIO, as well as practice OPP design patterns & apply SOLID principles too!