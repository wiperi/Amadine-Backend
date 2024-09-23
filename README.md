# DPST1093 Major Project

**✨ 🥜 Toohak 🥜 ✨**

## Contents

[[_TOC_]]

## Change Log

N/A

## 🫡 0. Aims:

1. Demonstrate effective use of software development tools to build full-stack end-user applications.
2. Demonstrate effective use of static testing, dynamic testing, and user testing to validate and verify software systems.
3. Understand key characteristics of a functioning team in terms of understanding professional expectations, maintaining healthy relationships, and managing conflict.
4. Demonstrate an ability to analyse complex software systems in terms of their data model, state model, and more.
5. Understand the software engineering life cycle in the context of modern and iterative software development practices in order to elicit requirements, design systems thoughtfully, and implement software correctly.
6. Demonstrate an understanding of how to use version control and continuous integration to sustainably integrate code from multiple parties.

## 🌈 1. Overview

UNSW College has been having severe issues with lecture attendance - student's just aren't coming to class, and they're citing that class isn't interesting enough for them.

UNSW College must resort to giving into the limited attention span of students and gamify lecture and tutorial time as much as possible - by doing interactive and colourful quizzes.

However, instead of licensing well-built and tested software, UNSW College is hoping to use the pool of extremely talented and interesting DPST1093 students to create their own version to distribute around campus for free. The chosen game to "take inspiration from" is **<a href="https://kahoot.com/">Kahoot</a>**.

The 24T3 cohort of DPST1093 students will build the **backend Javascript server** for a new quiz game platform, **Toohak**. We plan to task future COMP6080 students to build the frontend for Toohak, something you won't have to worry about.

**Toohak** is the questionably-named quiz tool that allows admins to create quiz games, and players to join (without signing up) to participate and compete.

We have already specified a **common interface** for the frontend and backend to operate on. This allows both courses to go off and do their own development and testing under the assumption that both parties will comply with the common interface. This is the interface **you are required to use**.

The specific capabilities that need to be built for this project are described in the interface at the bottom. This is clearly a lot of features, but not all of them are to be implemented at once.

(For legal reasons, this is a joke).

We highly recommend **creating and playing** a Kahoot game to better understand your task:
- To sign up and log in as an admin, go to [kahoot.com](https://kahoot.com/).
- To join a game created by an admin, go to [kahoot.it](https://kahoot.it/).

## 🐭 2. Iteration 0: Getting Started

[You can watch the iteration 0 introductory video here from a COMP1531 previous term.](https://youtu.be/81r1oUQHRNA) This video is not required watching (the specification is clear by itself) though many students find it useful as a starting point.

### 🐭 2.1. Task

This iteration is designed as a warm-up to help you setup your project, learn Git and project management practises (see Marking Criteria), and understand how your team works together.

In this iteration, you are expected to:
1. Write stub code for the basic functionality of Toohak. The basic functionality is defined as the `adminAuth*`, `adminQuiz*` capabilities/functions, as per the interface section below (2.2).
    * A stub is a function declaration and sample return value (see example below). **Do NOT write the implementation** for the stubbed functions. That is for the next iteration. In this iteration you are just focusing on setting up your function declarations and getting familiar with Git.
    * Each team member must stub **AT LEAST 1** function each.
    * Function stub locations should be inside files named a corresponding prefix e.g. `adminQuiz*` inside `quiz.js`.
    * Return values should match the interface table below (see example below).
```javascript
// Sample stub for the authLoginV1 function
// Return stub value matches table below
function adminAuthLogin(email, password) {
  return {
    authUserId: 1,
  }
}
```
1. Design a structure to store all the data needed for Toohak, and place this in the [code block](https://www.markdownguide.org/extended-syntax/#fenced-code-blocks) inside the `data.md` file. Specifically, you must consider how to store information about **users** and **quizzes** and populate ONE example `user` and `quiz` in your data structure (any values are fine - see example below).
    * Use the interface table (2.2) to help you decide what data might need to be stored. This will require making some educated guesses about what would be required to be stored in order to return the types of data you see. **Whilst the data structure you describe in data.md might be similar to the interface, it is a different thing to the interface.** If you're still confused, think of the interface like a restaurant menu, and `data.md` like where the food is stored in the back. It's all the same food, but the menu is about how it's packaged up and received from the kitchen, and `data.md` is describing the structure of how it's all stored behind the scenes. 
    * As functions are called, this structure would be populated with more users and quizzes, so consider this in your solution.
    * Focus on the structure itself (object/list composition), rather than the example contents.
```javascript
// Example values inside of a 'user' object might look like this
// NOTE: this object's data is not exhaustive,
// - you may need more/fewer fields stored as you complete this project. 
// We won't be marking you down for missing/adding too much sample data in this iteration.
{
  uId: 1,
  nameFirst: 'James',
  nameLast: 'Brond',
  email: 'thisisntmyemail@gmail.com',
}
```
1. Follow best practices for git and teamwork as discussed in lectures.
    * Create a group contract by completing `contract.md` - you may add/edit this template as you see fit.
    * You are expected to have **at least 1 meeting** with your group, and document the meeting(s) in meeting minutes which should be stored at a timestamped location in your repo (e.g. uploading a word doc/pdf or writing in the GitLab repo Wiki after each meeting). We have provided you with a `minutes-template.md` which you may use if you choose.
    * For this iteration each team member will need to make a minimum of **1 merge request per person** in your group into the `master` branch.
    * **1 merge request per function** must be made (11 in total).
    * Check out the lab on Git from week 1 to get familiar with using Git.

### 🐭 2.2. Functions to stub

The following are strings: `email`, `password`, `nameFirst`, `nameLast`, `name`, `description`.

The following are integers: `authUserId`, `quizId`.

In terms of file structure:
 * All functions starting with `adminAuth` or `adminUser` go in `auth.js`
 * All functions starting with `adminQuiz` go in `quiz.js`
 * `clear` goes in `other.js`

<table>
  <tr>
    <th>Name & Description</th>
    <th style="width:18%">Data Types</th>
  </tr>
  <tr>
    <td>
      <code>adminAuthRegister</code>
      <br /><br />
      Register a user with an email, password, and names, then returns their <code>authUserId</code> value.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( email, password, nameFirst, nameLast )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{
  authUserId: 1
}</code>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminAuthLogin</code>
      <br /><br />
      Given a registered user's email and password returns their <code>authUserId</code> value.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( email, password )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{
  authUserId: 1
}</code>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminUserDetails</code>
      <br /><br />
      Given an admin user's authUserId, return details about the user.
      <li>"<code>name</code>" is the first and last name concatenated with a single space between them</li>
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( authUserId )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{ user:
  {
    userId: 1,
    name: 'Jar Jar Brinks',
    email: 'mesasosorry@naboo.com.au',
    numSuccessfulLogins: 3,
    numFailedPasswordsSinceLastLogin: 1,
  }
}</code>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminUserDetailsUpdate</code>
      <br /><br />
      Given an admin user's authUserId and a set of properties, update the properties of this logged in admin user.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( authUserId, email, nameFirst, nameLast )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{ }</code> empty object
    </td>
  </tr>
  <tr>
    <td>
      <code>adminUserPasswordUpdate</code>
      <br /><br />
      Given details relating to a password change, update the password of a logged in user.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( authUserId, oldPassword, newPassword )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{ }</code> empty object
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizList</code>
      <br /><br />
      Provide a list of all quizzes that are owned by the currently logged in user.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( authUserId )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{ quizzes: [
    {
      quizId: 1,
      name: 'My Quiz',
    }
  ]
}</code>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizCreate</code>
      <br /><br />
      Given basic details about a new quiz, create one for the logged in user.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( authUserId, name, description )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{
  quizId: 2
}</code>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizRemove</code>
      <br /><br />
      Given a particular quiz, permanently remove the quiz.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( authUserId, quizId )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{ }</code> empty object
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizInfo</code>
      <br /><br />
      Get all of the relevant information about the current quiz.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( authUserId, quizId )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{
  quizId: 1,
  name: 'My Quiz',
  timeCreated: 1683125870,
  timeLastEdited: 1683125871,
  description: 'This is my quiz',
}</code>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizNameUpdate</code>
      <br /><br />
      Update the name of the relevant quiz.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( authUserId, quizId, name )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{ }</code> empty object
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizDescriptionUpdate</code>
      <br /><br />
      Update the description of the relevant quiz.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( authUserId, quizId, description )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{ }</code> empty object
    </td>
  </tr>
  <tr>
    <td>
      <code>clear</code>
      <br /><br />
      Reset the state of the application back to the start.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>()</code> no parameters
      <br /><br />
      <b>Return object:</b><br />
      <code>{ }</code> empty object
    </td>
    <td>
    </td>
  </tr>
</table>

### 🐭 2.3 Marking Criteria
<table>
  <tr>
    <th>Section</th>
    <th>Weighting</th>
    <th>Criteria</th>
  </tr>
  <tr>
    <td>Automarking (Implementation)</td>
    <td>20%</td>
    <td><ul>
      <li>Correct implementation of specified stubs</li>
    </ul></td>
  </tr>
  <tr>
  <tr>
    <td>Documentation</td>
    <td>20%</td>
    <td><ul>
      <li>Clear and obvious effort and time gone into thinking about possible representation of data structure for the project containing users and quizzes, inside of <code>data.md</code>.</li>
    </ul></td>
  </tr>
  <tr>
    <td>Git Practices</td>
    <td>30%</td>
    <td><ul>
      <li>Meaningful and informative git commit messages being used (see <a href="https://initialcommit.com/blog/git-commit-messages-best-practices#:~:text=commit%20message%20style.-,General%20Commit%20Message%20Guidelines,-As%20a%20general">examples</a>)</li>
      <li>Effective use of merge requests (from branches being made) across the team (as covered in lectures)</li>
      <li>At least 1 merge request per person and 1 merge request per function (11 in total) made into the <code>master</code> branch</li>
    </ul></td>
  </tr>
  <tr>
    <td>Project Management & Teamwork</td>
    <td>30%</td>
    <td><ul>
      <li>Completed group contract.</li>>
      <li>A generally equal contribution between team members.</li>
      <li>Effective use of course-provided MS Teams for communication, demonstrating an ability to competently manage teamwork online.</li>
      <li>Had a meeting together that involves planning and managing tasks, and taken notes from said meeting (and stored in a logical place in the repo e.g. Wiki section).</li>
    </ul></td>
  </tr>
</table>

### 🐭 2.4. Dryrun

We have provided a dryrun for iteration 0 consisting of one test for each function. Passing these tests means you have a correct implementation for your stubs, and have earned the marks for the automarking component iteration 0.**NOTE** This will only be applicable to Iteration 0 - from Iteration 1 onwards the dryrun will not guarantee the automarking marks, just a sanity check for the presence of all the required functions.

To run the dryrun, you should on a CSE machine (i.e. using `VLAB` or `ssh`'ed into CSE) be in the root directory of your project (e.g. `/project-backend`) and use the command:

```bash
~dp1093/bin/dryrun 0
```

### 🐭 2.5. Submission

Please see section 6 for information on **due date** and on how you will **demonstrate this iteration**.

[You can watch the iteration 1 introductory video here.](https://youtu.be/VPlNNy-gK2w) Please note that this video was recorded in 23T2, and there are changes in 24T2. You should consult this spec for changes. This video is not required watching (the specification is clear by itself) though many students will watch this for the practical demo of how to get started.


## 🐶 3. Iteration 1: Basic Functionality and Tests

### 🐶 3.1. Task

In this iteration, you are expected to:

1. Write tests for and implement the basic functionality of Toohak. The basic functionality is defined as the `adminAuth*`, `adminQuiz*` capabilities/functions, as per the interface section below.
    * Test files you add should all be in the form `*.test.js`.
    * Do NOT attempt to try and write or start a web server. Don't overthink how these functions are meant to connect to a frontend yet. That is for the next iteration. In this iteration you are just focusing on the basic backend functionality.

2. Follow best practices for git, project management, and effective teamwork, as discussed in lectures.
    * The marking will be heavily biased toward how well you follow good practices and work together as a team. Just having a "working" solution at the end is not, on its own, sufficient to even get a passing mark.

    * You need to use the [**GitLab Issue Boards**](https://docs.gitlab.com/ee/user/project/issue_board.html) (or similar) for your task tracking and allocation. Spend some time getting to know how to use the taskboard. If you would like to use another collaborative task tracker e.g. Jira, Trello, Airtable, etc. you must first get approval from your tutor and grant them administrator access to your team board.

    * You are expected to meet regularly with your group and document the meetings via meeting minutes, which should be stored at a timestamped location in your repo (e.g. uploading a word doc/pdf or writing in the GitLab repo Wiki after each meeting).

    * You should have regular standups and be able to demonstrate evidence of this to your tutor.

    * For this iteration, you will need to collectively make a minimum of **12 merge requests** into `master`.


### 🐶 3.2. Storing data

Nearly all of the functions will likely have to reference some "data source" to store information. E.g. If you register two users, create two quizzes, all of that information needs to be "stored" somewhere. The most important thing for iteration 1 is not to overthink this problem.

Firstly, you should **not** use an SQL database, or something like firebase.

Secondly, you don't need to make anything persist. What that means is that if you run all your tests, and then run them again later, it's OK for the data to be "fresh" each time you run the tests. We will cover persistence in another iteration.

Inside `src/dataStore.js` we have provided you with an object called `data` which will contain the information that you will need to access across multiple functions. An explanation of how to `get` and `set` the data is in `dataStore.js`. You will need to determine the internal structure of the object. If you wish, you are allowed to modify this data structure.

For example, you could define a structure in a file that is empty, and as functions are called, the structure populates and fills up like the one below:

```javascript
let data = {
    users: [
        {
            id: 1,
            nameFirst: 'user1',
        },
        {
            id: 2,
            nameFirst: 'user2',
        },
    ],
    quizzes: [
        {
            id: 1,
            name: 'quiz1',
        },
        {
            id: 2,
            name: 'quiz2',
        },
    ],
}
```
### 🐶 3.3. Implementing and testing features

You should first approach this project by considering its distinct "features". Each feature should add some meaningful functionality to the project, but still be as small as possible. You should aim to size features as the smallest amount of functionality that adds value without making the project more unstable. For each feature you should:

1. Create a new branch.
1. Write function stub/s for your feature. This may have been completed in iteration 0 for some functions.
1. Write tests for that feature and commit them to the branch. These will fail as you have not yet implemented the feature.
1. Implement that feature.
1. Make any changes to the tests such that they pass with the given implementation. You should not have to do a lot here. If you find that you are, you're not spending enough time on your tests.
1. Create a merge request for the branch.
1. Get someone in your team who **did not** work on the feature to review the merge request.
1. Fix any issues identified in the review.
1. After merge request is **approved** by a different team member, merge the merge request into `master`.

For this project, a feature is typically sized somewhere between a single function, and a whole file of functions (e.g. `auth.js`). It is up to you and your team to decide what each feature is.

There is no requirement that each feature is implemented by only one person. In fact, we encourage you to work together closely on features, especially to help those who may still be coming to grips with Javascript.

Please pay careful attention to the following:

* We want to see **evidence that you wrote your tests before writing your implementation**. As noted above, the commits containing your initial tests should appear *before* your implementation for every feature branch. If we don't see this evidence, we will assume you did not write your tests first and your mark will be reduced.
* Merging in merge requests with failing tests is **very bad practice**. Not only does this interfere with your team's ability to work on different features at the same time, and thus slow down development, it is something you will be **penalised** for in marking.
* Similarly, merging in branches with untested features is also **bad practice**. We will assume, and you should too, that any code without tests does not work.
* Pushing directly to `master` is not possible for this repo. The only way to get code into `master` is via a merge request. If you discover you have a bug in `master` that got through testing, create a bugfix branch and merge that in via a merge request.
* As is the case with any system or functionality, there will be some things that you can test extensively, some things that you can test sparsely/fleetingly, and some things that you can't meaningfully test at all. You should aim to test as extensively as you can, and make judgements as to what things fall into what categories.

### 🐶 3.4. Testing guidelines & advice

#### 🐶 3.4.1. Test Structure
The tests you write should be as small and independent as possible. This makes it easier to identify why a particular test may be failing. Similarly, try to make it clear what each test is testing for. Meaningful test names and documentation help with this. An example of how to structure tests has been done in:

* `src/echo.js`
* `src/echo.test.js`

_The echo functionality is tested, both for correct behaviour and for failing behaviour. As echo is relatively simple functionality, only 2 tests are required. For the larger features, you will need many tests to account for many different behaviours._

#### 🐶 3.4.2. Black Box Testing

Your tests should be *black box* unit tests:
  * Black box means they should not depend your specific implementation, but rather work with *any* faithful implementation of the project interface specification. I.e. you should design your tests such that if they were run against another group's backend they would still pass.
  * For iteration 1, you should *not* be importing the `data` object itself or directly accessing it via the `get` or `set` functions from `src/dataStore.js` inside your tests.
  * Unit tests mean the tests focus on testing particular functions, rather than the system as a whole. Certain unit tests will depend on other tests succeeding. It's OK to write tests that are only a valid test if other functions are correct (e.g. to test `quiz` functions you can assume that `auth` is implemented correctly).

This will mean you will use code like this to test login, for instance:

```javascript
let result = adminAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella')
adminAuthLogin('validemail@gmail.com', '123abc!@#') // Expect to work since we registered
```

#### 🐶 3.4.3. Resetting state

You should reset the state of the application (e.g. deleting all users, quizzes, etc.) at the start of every test. That way you know none of them are accidentally dependent on an earlier test. You can use a function for this that is run at the beginning of each test (hint: `clear`).

#### 🐶 3.4.4. Other help

* If you find yourself needing similar code at the start of a series of tests, consider using Jest's [**beforeEach**](https://jestjs.io/docs/api#beforeeachfn-timeout) to avoid repetition.

Sometimes you may ask "What happens if X?". In cases where we don't specify behaviour, we call this **undefined behaviour**. When something has undefined behaviour, you can have it behave any reasonable way you want - because there is no expectation or assumption of how it should act.

A common question asked throughout the project is usually "How can I test this?" or "Can I test this?". In any situation, most things can be tested thoroughly. However, some things can only be tested sparsely, and on some other rare occasions, some things can't be tested at all. A challenge of this project is for you to use your discretion to figure out what to test, and how much to test. Often, you can use the functions you've already written to test new functions in a black-box manner.

### 🐶 3.5. Iteration 1 Interface

The functions required for iteration 1 are described below.

All error cases should return <code>{error: 'specific error message here'}</code>, where the error message in quotation marks can be anything you like (this will not be marked).

The following are strings: `email`, `password`, `nameFirst`, `nameLast`, `name`, `description`, `oldPassword`, `newPassword`.

The following are integers: `authUserId`, `quizId`.

For timestamps, these are unix timestamps in seconds. You can find more information that here https://en.wikipedia.org/wiki/Unix_time

<table>
  <tr>
    <th>Name & Description</th>
    <th style="width:18%">Data Types</th>
    <th style="width:32%">Error returns</th>
  </tr>
  <tr>
    <td>
      <code>adminAuthRegister</code>
      <br /><br />
      Register a user with an email, password, and names, then returns their <code>authUserId</code> value.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( email, password, nameFirst, nameLast )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{ authUserId }</code>
    </td>
    <td>
      <b>Return object <code>{error: 'specific error message here'}</code></b> when any of:
      <ul>
        <li>Email address is used by another user.</li>
        <li>Email does not satisfy this: https://www.npmjs.com/package/validator (validator.isEmail function).</li>
        <li>NameFirst contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes.</li>
        <li>NameFirst is less than 2 characters or more than 20 characters.</li>
        <li>NameLast contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes.</li>
        <li>NameLast is less than 2 characters or more than 20 characters.</li>
        <li>Password is less than 8 characters.</li>
        <li>Password does not contain at least one number and at least one letter.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminAuthLogin</code>
      <br /><br />
      Given a registered user's email and password returns their <code>authUserId</code> value.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( email, password )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{ authUserId }</code>
    </td>
    <td>
      <b>Return object <code>{error: 'specific error message here'}</code></b> when any of:
      <ul>
        <li>Email address does not exist.</li>
        <li>Password is not correct for the given email.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminUserDetails</code>
      <br /><br />
      Given an admin user's authUserId, return details about the user.
      <li>"name" is the first and last name concatenated with a single space between them.</li>
      <li>numSuccessfulLogins includes logins direct via registration, and is counted from the moment of registration starting at 1.</li>
      <li>numFailedPasswordsSinceLastLogin is reset every time they have a successful login, and simply counts the number of attempted logins that failed due to incorrect password, only since the last login.</li>
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( authUserId )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{ user:
  {
    userId,
    name,
    email,
    numSuccessfulLogins,
    numFailedPasswordsSinceLastLogin,
  }
}</code>
    </td>
    <td>
      <b>Return object <code>{error: 'specific error message here'}</code></b> when any of:
      <ul>
        <li>AuthUserId is not a valid user.</li>
    </td>
  </tr>
  <tr>
  <td>
    <code>adminUserDetailsUpdate</code>
    <br /><br />
    Given an admin user's authUserId and a set of properties, update the properties of this logged in admin user. 
  </td>
  <td>
    <b>Parameters:</b><br />
    <code>( authUserId, email, nameFirst, nameLast )</code>
    <br /><br />
    <b>Return type if no error:</b><br />
    <code>{ }</code>
  </td>
  <td>
    <b>Return object <code>{error: 'specific error message here'}</code></b> when any of:
    <ul>
      <li>AuthUserId is not a valid user.</li>
      <li>Email is currently used by another user (excluding the current authorised user)</li>
      <li>Email does not satisfy this: https://www.npmjs.com/package/validator (validator.isEmail)</li>
      <li>NameFirst contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes</li>
      <li>NameFirst is less than 2 characters or more than 20 characters</li>
      <li>NameLast contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes</li>
      <li>NameLast is less than 2 characters or more than 20 characters</li>
    </ul>
  </td>
  </tr>
  <tr>
  </td>
    <td>
      <code>adminUserPasswordUpdate</code>
      <br /><br />
      Given details relating to a password change, update the password of a logged in user.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( authUserId, oldPassword, newPassword )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{ }</code>
    </td>
    <td>
      <b>Return object <code>{error: 'specific error message here'}</code></b> when any of:
      <ul>
        <li>AuthUserId is not a valid user.</li>
        <li>Old Password is not the correct old password</li>
        <li>Old Password and New Password match exactly</li>
        <li>New Password has already been used before by this user</li>
        <li>New Password is less than 8 characters</li>
        <li>New Password does not contain at least one number and at least one letter</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizList</code>
      <br /><br />
      Provide a list of all quizzes that are owned by the currently logged in user.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( authUserId )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{ quizzes: [
    {
      quizId,
      name,
    }
  ]
}</code>
    </td>
    <td>
      <b>Return object <code>{error: 'specific error message here'}</code></b> when any of:
      <ul>
        <li>AuthUserId is not a valid user.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizCreate</code>
      <br /><br />
      Given basic details about a new quiz, create one for the logged in user.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( authUserId, name, description )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{ quizId }</code>
    </td>
    <td>
      <b>Return object <code>{error: 'specific error message here'}</code></b> when any of:
      <ul>
        <li>AuthUserId is not a valid user.</li>
        <li>Name contains invalid characters. Valid characters are alphanumeric and spaces.</li>
        <li>Name is either less than 3 characters long or more than 30 characters long.</li>
        <li>Name is already used by the current logged in user for another quiz.</li>
        <li>Description is more than 100 characters in length (note: empty strings are OK).</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizRemove</code>
      <br /><br />
      Given a particular quiz, permanently remove the quiz.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( authUserId, quizId )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{ }</code>
    </td>
    <td>
      <b>Return object <code>{error: 'specific error message here'}</code></b> when any of:
      <ul>
        <li>AuthUserId is not a valid user.</li>
        <li>Quiz ID does not refer to a valid quiz.</li>
        <li>Quiz ID does not refer to a quiz that this user owns.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizInfo</code>
      <br /><br />
      Get all of the relevant information about the current quiz.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( authUserId, quizId )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{
  quizId,
  name,
  timeCreated,
  timeLastEdited,
  description,
}</code>
    </td>
    <td>
      <b>Return object <code>{error: 'specific error message here'}</code></b> when any of:
      <ul>
        <li>AuthUserId is not a valid user.</li>
        <li>Quiz ID does not refer to a valid quiz.</li>
        <li>Quiz ID does not refer to a quiz that this user owns.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizNameUpdate</code>
      <br /><br />
      Update the name of the relevant quiz.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( authUserId, quizId, name )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{ }</code>
    </td>
    <td>
      <b>Return object <code>{error: 'specific error message here'}</code></b> when any of:
      <ul>
        <li>AuthUserId is not a valid user.</li>
        <li>Quiz ID does not refer to a valid quiz.</li>
        <li>Quiz ID does not refer to a quiz that this user owns.</li>
        <li>Name contains invalid characters. Valid characters are alphanumeric and spaces.</li>
        <li>Name is either less than 3 characters long or more than 30 characters long.</li>
        <li>Name is already used by the current logged in user for another quiz.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizDescriptionUpdate</code>
      <br /><br />
      Update the description of the relevant quiz.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( authUserId, quizId, description )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{ }</code>
    </td>
    <td>
      <b>Return object <code>{error: 'specific error message here'}</code></b> when any of:
      <ul>
        <li>AuthUserId is not a valid user.</li>
        <li>Quiz ID does not refer to a valid quiz.</li>
        <li>Quiz ID does not refer to a quiz that this user owns.</li>
        <li>Description is more than 100 characters in length (note: empty strings are OK).</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>clear</code>
      <br /><br />
      Reset the state of the application back to the start.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{ }</code>
    </td>
    <td>
    </td>
  </tr>
</table>

### 🐶 3.6. Authorisation

Elements of securely storing passwords and other tricky authorisation methods are not required for iteration 1. You can simply store passwords plainly, and use the user ID to identify each user. We will discuss ways to improve the quality and methods of these capabilities in the later iterations.

Note that the `authUserId` variable is simply the user ID of the user who is making the function call. For example,
* A user registers an account with Toohak and is assigned some integer ID, e.g. `42` as their user ID.
* When they make subsequent calls to functions, their user ID - in this case, `42` - is passed in as the `authUserId` argument.

Since `authUserId` refers to the user ID of the user calling the functions, you do NOT need to store separate user IDs (e.g. a uId or userId + a authUserId) to identify each user in your data structure - you only need to store one user ID. How you name this user ID property in your data structure is up to you.

### 🐶 3.7. Working in parallel

This iteration provides challenges for many groups when it comes to working in parallel. Your group's initial reaction will be that you need to complete registration before you can complete quiz creation, and then quiz creation must be done before you update a quiz name, etc.

There are several approaches that you can consider to overcome these challenges:

* Have people working on down-stream tasks (like the quiz implementation) work with stubbed versions of the up-stream tasks. E.g. The register function is stubbed to return a successful dummy response, and therefore two people can start work in parallel.
* Co-ordinate with your team to ensure prerequisite features are completed first (e.g. Giuliana completes `adminAuthRegister` on Monday meaning Hayden can start `adminQuizCreate` on Tuesday).
* You can pull any other remote branch into your own using the command `git pull origin <branch_name>`.
    * This can be helpful when two people are working on functions on separate branches where one function is a prerequisite of the other, and an implementation is required to keep tests from failing.
    * You should pull from `master` on a regular basis to ensure your code remains up-to-date.

### 🐶 3.8. Marking Criteria

<table>
  <tr>
    <th>Section</th>
    <th>Weighting</th>
    <th>Criteria</th>
  </tr>
  <tr>
    <td>Automarking (Testing & Implementation)</td>
    <td>40%</td>
    <td>
      <ul>
      <li>Correct implementation of specified functions.</li>
    </ul>
      Whilst we look at your group's work as a whole, if we feel that materially unequal contributions occurred between group members we will assess your individual contribution against this criteria.
    </td>
  </tr>
  <tr>
    <td>Test Quality</td>
    <td>15%</td>
    <td>
      Develop tests that show a clear demonstration of:
      <ul>
        <li>Good test <b>coverage</b> - how well you cover the use cases (no need to run a coverage checker in this iteration).</li>
        <li>Good test  <b>clarity</b> in communicating the purpose of tests and code.</li>
        <li>Good test <b>design</b> - thoughtful, clear, and modular layout that follows course examples.</li>
      </ul>
      Whilst we look at your group's work as a whole, if we feel that materially unequal contributions occurred between group members we will assess your individual contribution against this criteria.
    </td>
  </tr>
  <tr>
    <td>General Code Quality</td>
    <td>10%</td>
    <td>
      <ul>
        <li>Appropriate use of Javascript data structures (arrays, objects, etc.)</li>
        <li>Appropriate style as covered so far in introductory programming.</li>
      </ul>
      Whilst we look at your group's work as a whole, if we feel that materially unequal contributions occurred between group members we will assess your individual contribution against this criteria.
    </td>
  </tr>
  <tr>
    <td>Git Practices, Project Management, Teamwork</td>
    <td>35%</td>
    <td>
      As an individual, in terms of git:
      <ul>
        <li>For particular features, committing the bulk of your tests prior to your implementation.</li>
        <li>Your git commit messages are meaningful, clear, and informative.</li>
        <li>You contribute at least 2 meaningful merge requests (approved by a team member) that merge your branch code to master.</li>
      </ul>
      As an individual, in terms of project management and teamwork:
      <ul>
        <li>Attendance to group check ins every week.</li>
        <li>Effective use of course-provided MS Teams for effective communication with your group.</li>
        <li>Use of issue board on Gitlab OR another equivalent tool that is used to effectively track your tasks.</li>
        <li>Attendance and contributions at your teams standups, including at least one scenario where you were the leader of the meeting and took the minutes/notes for that meeting.</li>
      </ul>
    </td>
  </tr>
</table>

For this and for all future milestones, you should consider the other expectations as outlined in section 6 below.

The formula used for automarking in this iteration is:

`Mark = t * i` (Mark equals `t` multiplied by `i`).

Where:
 * `t` is the mark you receive for your tests running against your code (100% = your implementation passes all of your tests).
 * `i` is the mark you receive for our course tests (hidden) running against your code (100% = your implementation passes all of our tests).

### 🐶 3.9. Dryrun

We have provided a very simple dryrun for iteration 1 consisting of a few tests, including your implementation of `adminAuthRegister`, `adminAuthLogin`, `adminQuizCreate`. These only check the format of your return types and simple expected behaviour, so do not rely on these as an indicator of the correctness of your implementation or tests.

To run the dryrun, you should be on a CSE machine (i.e. using `VLAB` or `ssh`'ed into CSE) and in the root directory of your project (e.g. `/project-backend`) and use the command:

```bash
1531 dryrun 1
```

To view the dryrun tests, you can run the following command on CSE machines:
```bash
cat ~dp1093/bin/iter1.test.js
```

Your tutor will provide you with a *JEST* version of this file in Week 4 that you can run locally as well.

Tips to ensure dryrun runs successfully:
* Files sit within the `/src` directory.

### 🐶 3.10. Submission & Peer Assessment

Please see section 6 for information on **due date** and on how you will **demonstrate this iteration**.

Please see section 7.5 for information on **peer assessment**.


## 🐝 4. Iteration 2: Building a Web Server


### 🐝 4.1. Task

In this iteration, more features were added to the specification, and the focus has been changed to HTTP endpoints. Most of the theory surrounding iteration 2 is covered in week 4-5 lectures. Note that there will still be some features of the frontend that will not work because the routes will not appear until iteration 3. There is no introductory video for iteration 2.

Iteration 2 both reuses a lot of work from iteration 1, as well as has new work. Most of the work from iteration 1 can be recycled, but the following consideration(s) need to be made from previous work:
 * `DELETE /v1/admin/quiz/{quizid}` now requires that upon deletion items are moved to trash instead of permanently removed.

If you'd like more support in this iteration, you can see a [previous term's video](https://www.youtube.com/watch?v=j0P-SA8bwSs) where a lecturer discusses iteration 2 with the students of that term.

In this iteration, you are expected to:

1. Make adjustments to your existing code as per any feedback given by your tutor for iteration 1.
2. Migrate to Typescript by changing `.js` file extensions to `.ts`.
3. Implement and test the HTTP Express server according to the [entire interface provided in the specification](swagger.yaml).

    * Part of this section may be automarked.

    * Your implementation should build upon your work in iteration 1, and ideally your HTTP layer is just a wrapper for underlying functions you've written that handle the logic, see week 4 content.

    * Your implementation will need to include persistence of data (see section 4.7).

    * Introduce user sessions for your login system (see 4.9).

    * You can structure your tests inside a `/tests` folder (or however you choose), as long as they are appended with `.test.ts`. For this iteration and iteration 3 we will only be testing your HTTP layer of tests. You may still wish to use your iteration 1 tests and simply wrap up them - that is a design choice up to you. An example of an HTTP test can be found in section 4.4.

    * You do not have to rewrite all of your iteration 1 tests as HTTP tests - the latter can test the system at a higher level. For example, to test a success case for `POST /v1/admin/quiz/{quizid}/transfer` via HTTP routes you will need to call `POST /v1/admin/auth/register` and `POST /v1/admin/quiz`; this means you do not need the success case for those two functions seperately. Your HTTP tests will need to cover all success/error conditions for each endpoint, however.

4. Ensure your code is linted to the provided style guide.

    * `eslint` should be added to your repo via `npm` and then added to your `package.json` file to run when the command `npm run lint` is run. The provided `.eslintrc.json` file is *very* lenient, so there is no reason you should have to disable any additional checks. See section 4.6 below for instructions on adding linting to your pipeline.

    * You are required to edit the `gitlab-ci.yml` file, as per section 4.5 to add linting to the code on `master`. **You must do this BEFORE merging anything from iteration 2 into `master`**, so that you ensure `master` is always stable.

5. Continue demonstrating effective project management and effective git usage.

    * You will be heavily marked for your use of thoughtful project management and use of git effectively. The degree to which your team works effectively will also be assessed. This iteration we will be enforcing a new git message policy.

    * As for iteration 1, all task tracking and management will need to be done via the GitLab Issue Board or another tracking application approved by your tutor.

    * As for iteration 1, regular group meetings must be documented with meeting minutes which should be stored at a timestamped location in your repo (e.g. uploading a word doc/pdf or writing in the GitLab repo wiki after each meeting).

    * As for iteration 1, you must be able to demonstrate evidence of regular standups. We will provide a standup meeting template to help with this.

    * You are required to regularly and thoughtfully make merge requests for the smallest reasonable units, and merge them into `master`.

6. (Recommended) Remove any type errors in your code

    * Run `npm run tsc` and incrementally fix all type errors.
    
    * Either choose to change one file at a time, or change all file extensions and use `// @ts-nocheck` at the beginning of select files to disable checking on that specific file, omitting errors.

    * There are no explicit marks this term for completing this step, however:
      * Groups who ensure their code are type-safe tend to perform much better in the automarker.
      * For iteration 3, if you make your entire code type safe you will receive 10 bonus marks! Starting early makes that easier!

A frontend has been built that you can use in this iteration, and use your backend to power it (note: an incomplete backend will mean the frontend cannot work). You can, if you wish, make changes to the frontend code, but it is not required. The source code for the frontend is only provided for your own fun or curiosity.

**As part of this iteration it is required that your backend code can correctly power the frontend**. You should conduct acceptance tests (run your backend, run the frontend and check that it works) prior to submission.

In this iteration we also expect for you to improve on any feedback left by tutors in iteration 1.

### 🐝 4.2. Running the server

To run the server you can the following command from the root directory of your project:

```bash
npm start
```

This will start the server on the port in the src/server.ts file, using `ts-node`.

If you get an error stating that the address is already in use, you can change the port number in `config.json` to any number from `49152` to `65535`. Is it likely that another student may be using your original port number. We recommend that you use the format `49xxx` where `xxx` is the last 3 digits of your zID. E.g. if your zID is `5000123`, then you should change the port number in `config.json` to be `49123`

Do **NOT** move the location of either `config.json` or `server.ts`

### 🐝 4.3. Implementing and testing features

You should first approach this project by considering its distinct "features". Each feature should add some meaningful functionality to the project, but still be as small as possible. You should aim to size features as the smallest amount of functionality that adds value without making the project more unstable. For each feature you should:

1. Create a new branch.
2. Write tests for that feature and commit them to the branch. These will fail as you have not yet implemented the feature.
3. Implement that feature.
4. Make any changes to the tests such that they pass with the given implementation. You should not have to do a lot here. If you find that you are, you're not spending enough time on your tests.
5. Create a merge request for the branch.
6. Get someone in your team who **did not** work on the feature to review the merge request. When reviewing, **not only should you ensure the new feature has tests that pass.** but you should also evaluate their correctness and completeness against the spec.
7. Fix any issues identified in the review.
8. Merge the merge request into master.

For this project, a feature is typically sized somewhere between a single function, and a whole file of functions (e.g. `auth.ts`). It is up to you and your team to decide what each feature is.

There is no requirement that each feature be implemented by only one person. In fact, we encourage you to work together closely on features, especially to help those who may still be coming to grips with Javascript.

Please pay careful attention to the following:

* We want to see **evidence that you wrote your tests before writing your implementation**. As noted above, the commits containing your initial tests should appear *before* your implementation for every feature branch. If we don't see this evidence, we will assume you did not write your tests first and your mark will be reduced.
* You should have black-box tests for all tests required (i.e. testing each function/endpoint).
* Merging in merge requests with failing pipelines is **very bad practice**. Not only does this interfere with your teams ability to work on different features at the same time, and thus slow down development, it is something you will be penalised for in marking.
* Similarly, merging in branches with untested features is also **very bad practice**. We will assume, and you should too, that any code without tests does not work.
* Pushing directly to `master` is not possible for this repo. The only way to get code into `master` is via a merge request. If you discover you have a bug in `master` that got through testing, create a bugfix branch and merge that in via a merge request.
* As is the case with any system or functionality, there will be some things that you can test extensively, some things that you can test sparsely/fleetingly, and some things that you can't meaningfully test at all. You should aim to test as extensively as you can, and make judgements as to what things fall into what categories.

### 🐝 4.4. Testing the interface

In this iteration, **the layer of abstraction has changed to the HTTP level**, meaning that you are only required to write integration tests that check the HTTP endpoints, rather than the style of tests you write in iteration 1 where the behaviour of the Javascript functions themselves was tested.

You will need to check as appropriate for each success/error condition:
* The return value of the endpoint;
* The behaviour (side effects) of the endpoint; and
* The status code of the response.

An example of how you would now test the echo interface is in `newecho.test.ts`.

### 🐝 4.5. Testing time-based properties

Some routes will have timestamps as properties. The tricky thing about timestamps is that the client makes a request at a known time, but there is a delay between when the client sends the request and when the server processes it. E.G. You might send an HTTP request to create a quiz, but the server takes 0.3 seconds until it actually creates the object, which means that the timestamp is 0.3 seconds out of sync with what you'd expect.

To solve this, when checking if timestamps are what you would expect, just check that they are within a 1 second range.

E.G. If I create a quiz at 12:22:21pm I will then check in my tests if the timestamp is somewhere between 12:22:21pm and 12:22:22pm.

### 🐝 4.6. Continuous Integration

With the introduction of linting to the project with `ESlint`, you will need to manually edit the `gitlab-ci.yml` file to lint code within the pipeline. This will require the following:
 * Addition of `npm run lint` as a script under a custom `linting` variable, apart of `stage: checks`.

Refer to the lecture slides on continuous integration to find exactly how you should add these.

### 🐝 4.7. Storing data

You are required to store data persistently in this iteration.

Modify your backend such that it is able to persist and reload its data store if the process is stopped and started again. The persistence should happen at regular intervals so that in the event of unexpected program termination (e.g. sudden power outage) a minimal amount of data is lost. You may implement this using whatever method of serialisation you prefer (e.g. JSON).

### 🐝 4.8. Versioning

You might notice that some routes are prefixed with `v1`. Why is this? When you make changes to specifications, it's usually good practice to give the new function/capability/route a different unique name. This way, if people are using older versions of the specification they can't accidentally call the updated function/route with the wrong data input. If we make changes to these routes in iteration 3, we will increment the version to `v2`.

Hint: Yes, your `v1` routes can use the functions you had in iteration 1, regardless of whether you rename the functions or not. The layer of abstraction in iteration 2 has changed from the function interface to the HTTP interface, and therefore your 'functions' from iteration 1 are essentially now just implementation details, and therefore are completely modifiable by you.

### 🐝 4.9. User Sessions

#### The problem with Iteration 1 `authUserId`

In iteration 1, a problem we have with the `authUserId` is that there is no way to "log-out" a user - because all the user needs to identify themselves is just their user ID.

In iteration 2, we want to issue something that abstracts their user ID into the notion of a user session - this way a single user can log in, log out, or maybe log in from multiple places at the same time.

If you're not following the issue with the `authUserId`, imagine it like trying to board a plane flight but your boarding pass IS your passport. Your passport is a (effectively) a permanent thing - it is just "always you". That wouldn't work, which is why airlines issue out boarding passes - to essentially grant you a "session" on a plane. And your boarding pass is linked to your passport. In this same way, a user session is associated with an `authUserId`!

#### How we adapt in Iteration 2 - User Sessions

In iteration 2, instead of passing in `authUserId` into functions, we will instead pass in a user session. Then on our server we look up the user session information (which we've stored) to:
* Identify if the user session is valid.
* Identify which user this user session belongs to.

Then in this way, we can now allow for things like the ability to meaningfully log someone out, as well as to have multiple user sessions at the same time for multiple users, or even the same user (e.g. imagine being logged in on two computers but only wanting to log one out).

#### The term `token`

You may however notice in the specification that the word `token` is used - not user session. This is because when sending HTTP requests a common practice is to package up information relating to the user session, we wrap it up into an object called a `token`. This token could take on a number of different forms, though the simplest form is to just have your user session inside a token object:
```json
{
  "userSessionId": 23145
}
```

A token is generally stringified for sending over HTTP - since everything over an HTTP request needs to be stringified. This is typically done with JSON. If you pass a JSONified object (as opposed to just a string or a number) as a token, we recommend that you use [encodeURIComponent](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent) and [decodeURIComponent](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/decodeURIComponent) to encode it to be friendly for transfer over URLs.

How you generate unique identifiers for user sessions is up to you.

#### In summary

Implentation details are up to you, though the key things to ensure that you comply with are that:
* Token is an object that contains some information that allows you to derive a user session.
* Your system allows multiple user sessions to be able to be logged in and logged out at the same time.

#### Other notes

### 🐝 4.10. Error returning

Either a `400 (Bad Request)` or `401 (Unauthorized)` or `403 (Forbidden)` is thrown when something goes wrong. A `400` error refers to issues with user input; a `401` error refers to when someone does not attempt to authenticate properly, and a a `403` error refers to issues with authorisation. Most of the routes in the API interface provided through types of these errors under various conditions.

To throw one of these errors, simply use the code `res.status(400).send(JSON.stringify({ error: 'specific error message here' }))` or `res.status(400).json({ error: 'specific error message here' })` in your server where 400 is the error.

Errors are thrown in the following order: 401, then 403, then 400.

#### 🐝 4.11.1 HTTP Layer Seperation

Ideally you will not need to change the way you return errors from your logic functions that you wrote in Iteration 1.

Instead, your HTTP Layer should use helper function calls to handle 401 and 403 errors and rely on logic function calls to handle 400 errors.

Apart from these error checks, there should be **no logic in your HTTP Layer (server.ts)**.

What does this look like:

```javascript
// GET /v1/admin/quiz/{quizid}
app.get('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  // manage the quizid from params 
  const quizId = ...
  // manage user session token 
  const token = ...
  // check for correct token using helperfunction getAuthUserIdFromToken
  const authUserId = getAuthUserIdFromToken;
  if (!authUserId) {
    // can't find a correspoding user session for given token
    return res.status(401).json({'error': 'Invalid token'});
  }

  // check to see if a quiz matching the quizId exists using the helper function getQuizFromQuizId
  const quiz = getQuizFromQuizId(quizId);
  if (!quiz) {
    // quiz does not exist for given quizid
    return res.status(403).json({'error': 'Invalid QuizId'});
  }

  // check to see if the quiz owner is the same as the current user session
  if (quiz.authUserId !== authUserId) {
    return res.status(403).json({'error': 'User does not own the quiz'});
  }
  // call the logic layer function
  const result = adminQuizInfo(authUserId, quizId);
  // if there is an error, return it with 400 status code
  if ('error' in result) {
    return res.status(400).json(result);
  }
  
  // no errors, normal return managed by logic function
  res.json(result);
});
```

### 🐝 4.11. Working with the frontend

There is a SINGLE repository available for all students at 
https://nw-syd-gitlab.cseunsw.tech/DPST1093/24T3/project-frontend. 
You can clone this frontend locally. 

Please remember to pull regularly as we continue to work on the frontend.

If you run the frontend at the same time as your express server is running on the backend, then you can power the frontend via your backend.

Please note: The frontend may have very slight inconsistencies with expected behaviour outlined in the specification. Our automarkers will be running against your compliance to the specification. The frontend is there for further testing and demonstration.

Please note: This frontend is experiment. It will not be perfect and is always under development.

#### 🐝 4.11.1. Example implementation

A working example of the Toohak application can be used at https://project-frontend-1531.vercel.app/. This is not a gospel implementation that dictates the required behaviour for all possible occurrences. Our implementation will make reasonable assumptions just as yours will, and they might be different, and that's fine. However, you may use this implementation as a guide for how your backend should behave in the case of ambiguities in the spec.

The data is reset occasionally, but you can use this link to play around and get a feel for how the application should behave.

Please note: This frontend and backend that powers this example is experiment. It will not be perfect and is always under 
development.

### 🐝 4.12. Recommended approach

Our recommendation with this iteration is that you start out trying to implement the new functions similarly to how you did in iteration 1.

1. Spend the first week organising, planning and transforming. Identify common functionality and build out a list of helper functions. Then organise the project into 4 sprints an set delivery dates for each sprint.
2. Write HTTP tests. These will fail as you have not yet implemented the feature.
  * ‼️‼️ HINT: To improve the marks you get and speed at which you get work done, consider trying to avoid re-writing your tests for iteration 2 and instead tweak your iteration 1 tests that they can be "used" by the HTTP server.
3. Implement the feature and write the Express route/endpoint for that feature too.
  * ‼️‼️ HINT: make sure GET and DELETE requests utilise query parameters, whereas POST and PUT requests utilise JSONified bodies.
4. Run the tests and continue following 4.3. as necessary.

**Please note, when you have a single route (e.g. `/my/route/name`) alongside a wildcard route (e.g. `/my/route/{variable}`) you need to define the single route before the variable route.**

### 🐝 4.13. Sprint Planning and Organisation

For this iteration, we expect you to do most of the organisation tasks introduced in Iteration 0 and Iteration 1 by yourselves.

**NOTE:: This section will be assessed earlier than the rest of Iteration 2. It will be due Tue 9am, Week 06 (01st Oct).**

#### 🐝 4.13.1. Sprint Organisation tasks

You will be expected to go through Iteration 2 and do the following:
1. Identify data model updates by doing a Data Model Walkthrough for the HTTP Routes for Iteration 2
2. Identify Blocker and Helper/Common functions by doing an Organisation Walkthrough for Iteration 2
3. Build a dependancy graph for all your functions
4. Split all your tasks into Tiers to complete the least dependant items in earlier sprints and most dependant items in later sprints
5. Splint those tasks amongst 4 sprints: one organisation and set-up sprint followed by three coding sprints - Use the Sprint Template in your Wiki to document what happens in each Sprint. We should see 4 seperate Sprint Organisation entries
3. Carry out any updates recommended by your tutors/lab demonstrators to your iteration 1 functions
4. Switch all your logic and test files from .js to .ts
5. Merge Iteration 2 release into your master
6. Write HTTP Layer Endpoint stubs into server.ts
7. Write Logic Layer stubs into src/*.ts where * is the appropriate file

#### 🐝 4.13.2. Sprint Leader

This Iteration we are giving each person an opportunity to act as a leader. No-one can be the leader twice during the same Iteration.

Each sprint you will designate a sprint leader. The leader will have the following responsibilities:
1. Running Meetings by preparing an Agenda prior to each meeting.
2. Recording Meeting Minutes on the Wiki
3. Asking team questions from their Project Manager (Your designated Tutor)
4. Preparing a hand-off for the next Sprint Leader at the end of the week:
    1. A wiki entry titled "Iteration 2 - Sprint 1 or 2 or 3 or 4 - Hand-off" with the following:
        1. Which of the designated tasks were done
        2. Which (if any) are still pending
        3. Any recommendations for the next sprint

### 🐝 4.14. Git Commit Message Guidelines

In order to give greater clarity during code reviews, we are asking everyone to adhere to a git commit message guideline.

This is to make your organisation more readable and to enforce atomic git practice (i.e. try to do only one type of change on one file per commit).

We will mostly follow the guidelines outlined in Conventional Commits specification found here: [https://www.conventionalcommits.org/en/v1.0.0/#specification](https://www.conventionalcommits.org/en/v1.0.0/#specification).

This [Medium post](https://medium.com/neudesic-innovation/conventional-commits-a-better-way-78d6785c2e08) is also very useful.

In addition, we will add some other common practices as well.

#### 🐝 4.14.1. Conventional Commits

This guideline mostly looks to standardize commit messages by following this simple structure:
```
    <type>[(optional <scope>)]: <description>
    <empty line>
    [optional <body>]
    <empty line>
    [optional <footer(s)>] 
```
Let us describe the above structure:
1. `<type>`: The reason the change to the code base was made. Typical reasons could be:
    1. feat    : Adding a new feature
    2. fix     : Updating/fixing an existing feature that had a bug
    3. docs    : Adding/Changing Documentation
    4. refactor: Cleaning up or refactoring code
    5. test    : Adding/Changing tests
    6. style   : Updating code style
    7. ci      : Continuous Integration related task
    8. chore   : Non-feature related or multi feature related technical or prevantive maintenance
    9. other types can be found on the Conventional Commits website
2. `optional` : This means you do not need to add this section
3. `<scope>` : The broad area that is affected by this change. e.g. `feat(data)` would indicate a change to the data layer or `feat(http)` would indicate a change to the http layer.
4. `<description>`: A short heading describing what you have done this commit. Usually less than 52 characters.
5. `<empty line>`: An empty line to seperate sections of the commit message.
6. `<body>`: Additional details and descriptions about what the changes were this commit.
7. `<footer>`: A tag of the Issues or Merge Requests this commit is related to. E.g. #15!,#17! or #18,#MR12! etc.

Our expectation is that you try to add the optional sections whenever possible.

####  🐝 4.14.2. Example commit messages

You can see some example commit messages from the commit history when you merge Iteration 2 into master. Here are some other examples:
1. Updated data layer to have persistence:
    ```
    feat(data): Added persistence to data layer
    
    Added save() and load() functions to be called by setData() and getData() respectively

    #74!
    ```
2. Added test for GET /v1/admin/quiz/{quizinfo}:
    ```
    test(http): Added error test cases for adminQuizInfo

    Test case for 401 error
    
    #82!
    ```
3. After testing, fixed a bug in adminQuizInfo:
    ```
    fix: incorrect call on checkUserSession in AQI

    checkUserSession expected a string input, AQI tried sending a number

    #103!
    ```
4. Removed an extra newline/cleaned up some code spacing issues in AQI:
    ```
    style: cleaned up AQI
    ```



### 🐝 4.15. Marking Criteria

<table>
  <tr>
    <th>Section</th>
    <th>Weighting</th>
    <th>Criteria</th>
  </tr>
  <tr>
    <td>Automarking (Testing & Implementation)</td>
    <td>45%</td>
    <td>
      <ul>
      <li>Correct implementation of specified functions.</li>
      <li>Correctly written tests based on the specification requirements.</li>
      <li>Correctly linted code.</li>
    </ul>
    Whilst we look at your group's work as a whole, if we feel that materially unequal contributions occurred between group members we will assess your individual contribution against this criteria.
    </td>
  </tr>
  <tr>
    <td>Sprint Planning</td>
    <td>10%</td>
    <td>
      <ul>
        <li>Proper breakdown of Iteration 2 into <b>four week-long sprints</b> for organisation</li>
        <li>Identify breaking and helper functions</li>
        <li>Allocate tasks into sprints with <b>strict</b> deadlines inside each sprint</li>
      </ul>
      <b>Note :: This part is due Tues 9am, Week 06 (01st Oct)</b>
    </td>
  </tr>
  <tr>
    <td>Test Quality</td>
    <td>15%</td>
    <td>
      <ul>
        <li>Good test <b>coverage</b> - how well you cover the use cases (no need to run a coverage checker in this iteration).</li>
        <li>Good test  <b>clarity</b> in communicating the purpose of tests and code.</li>
        <li>Good test <b>design</b> - thoughtful, clear, and modular layout that follows course examples.</li>
      </ul>
      Whilst we look at your group's work as a whole, if we feel that materially unequal contributions occurred between group members we will assess your individual contribution against this criteria.
    </td>
  </tr>
  <tr>
    <td>General Code Quality</td>
    <td>10%</td>
    <td>
      <ul>
        <li>Appropriate use of Javascript data structures (arrays, objects, etc.).</li>
        <li>Appropriate style as described in section 7.4.</li>
        <li>Appropriate application of good software design practices.</li>
        <li>Implementation of persistent state.</li>
        <li>Demonstrated successful connection of the supplied frontend to the backend code required for iteration 2 (doesn't have to be perfect).</li>
      </ul>
      Whilst we look at your group's work as a whole, if we feel that materially unequal contributions occurred between group members we will assess your individual contribution against this criteria.
    </td>
  </tr>
  <tr>
    <td>Git Practices, Project Management, Teamwork</td>
    <td>20%</td>
    <td>
      As an individual, in terms of git:
      <ul>
        <li>For particular features, committing the bulk of your tests prior to your implementation.</li>
        <li>Most of your git commit messages are meaningful, clear, and informative and follow the standard set out by Conventional Commits in [4.14](#-414-git-commit-message-guidelines) and tutorial 05</li>
        <li>You contribute at least 1 meaningful merge requests PER WEEK (approved by a team member) that merges your branch code to master.</li>
      </ul>
      As an individual, in terms of project management and teamwork:
      <ul>
        <li>Attendance to group check ins every week.</li>
        <li>Effective use of course-provided MS Teams for effective communication with your group.</li>
        <li>Use of issue board on Gitlab OR another equivalent tool that is used to effectively track your tasks.</li>
        <li>Attendance and contributions at your teams standups, including at least one scenario where you were the leader of the meeting and took the minutes/notes for that meeting.</li>
      </ul>
    </td>
  </tr>
</table>

For this and for all future milestones, you should consider the other expectations as outlined in section 7 below.

The formula used for automarking in this iteration is:

`Automark = 95*(t * i) + 5*e`
(Mark equals 95% of `t` multiplied by `i` plus 5% of `e`). This formula produces a value between 0 and 1.

Where:
 * `t` is the mark between 0-1 you receive for your tests running against your code (100% = your implementation passes all of your tests).
 * `i` is the mark between 0-1 you receive for our course tests (hidden) running against your code (100% = your implementation passes all of our tests).
 * `e` is the score between 0-1 achieved by running eslint against your code with the provided configuration. You may find a mark of 0 if you have used eslint disable comments in your code.


### 🐝 4.14. Dryrun

The dryrun checks the format of your return types and simple expected behaviour for a few basic routes. Do not rely on these as an indicator for the correctness of your implementation or tests.

To run the dryrun, you should be in the root directory of your project (e.g. `/project-backend`) and use the command:

```bash
1531 dryrun 2
```

To view the dryrun tests, you can run the following command on CSE machines:
```bash
cat ~cs1531/bin/iter2.test.js
```

### 🐝 4.15. Submission & Peer Assessment

Please see section 6 for information on **due date** and on how you will **demonstrate this iteration**.

Please see section 7.5 for information on **peer assessment**.

## 🦆 5. Iteration 3: Completing the Lifecycle

Coming Soon

## 🌸 6. Due Dates and Weightings

| Iteration | Due date                            | Demonstration to tutor(s)      | Assessment weighting (%) |
| --------- | ----------------------------------- | ------------------------------ | ------------------------ |
| 0         | 9am Friday 6th Sep (**week  2**)  | No demonstration               | 5% of project mark ( 3% overall)  |
| 1         | 9am Friday 20th Sep (**week  4**)  | In YOUR **week  5** tutorial or lab | 30% of project mark (18% overall)  |
| 2         | 9am Friday 18th Oct (**week  8**)  | In YOUR **week  9** tutorial or lab | 35% of project mark (21% overall)  |
| 3         | 9am Friday 8th Nov (**week 11**)  | In YOUR **week 12** tutorial | 30% of project mark (18% overall)  |

### 🌸 6.1. Submission & Late Penalties

To submit your work, simply have your master branch on the gitlab website contain your groups most recent copy of your code. I.E. "Pushing to master" is equivalent to submitting. When marking, we take the most recent submission on your master branch that is prior to the specified deadline for each iteration.

The following late penalties apply depending on the iteration:
 * Iteration 0: No late submissions at all
 * Iteration 1: No late submissions at all
 * Iteration 2: No late submissions at all
 * Iteration 3: Can submit up to 72 hours late, with 5% penalty applied every time a 24 hour window passes, starting from the due date 

We will not mark commits pushed to master after the final submission time for a given iteration.

If the deadline is approaching and you have features that are either untested or failing their tests, **DO NOT MERGE IN THOSE MERGE REQUESTS**. In some rare cases, your tutor will look at unmerged branches and may allocate some reduced marks for incomplete functionality, but `master` should only contain working code.

Minor isolated fixes after the due date are allowed but may carry a penalty to the automark. If the isolated fixes result in a higher automark result (minus the penalty), then we will update your mark. E.g. imagine that your initial automark is 20%, on re-run you get a raw automark of 86%, and your fixes attract a 30% penalty: since the 30% penalty will reduce the mark of 86% to 60%, your final **automark** will be 60%.

If the re-run automark after penalty is lower than your initial mark, we will keep your initial mark. E.g. imagine that your initial automark is 50%, on re-run you get a raw automark of 70%, and your fixes attract a 30% penalty: since the 30% penalty will reduce the mark of 70% to 49%, your final **automark** will still be 50% (i.e. your initial mark).Minor isolated fixes after the due date are allowed but carry a penalty to the automark, if the automark after re-running the autotests is greater than your initial automark. This penalty can be up to 30% of the automarking component for that iteration, depending on the number and nature of your fixes. Note that if the re-run automark after penalty is lower than your initial mark, we will keep your initial mark, meaning your automark cannot decrease after a re-run. E.g. imagine that your initial automark is 50%, on re-run you get a raw automark of 70%, and your fixes attract a 30% penalty: since the 30% penalty will reduce the mark of 70% to 49%, your final automark will still be 50% (i.e. your initial mark).

#### How to request a re-run

* Create a branch, e.g. `iter[X]-fix`, based off the submission commit.
* Make the minimal number of necessary changes (i.e. only fix the trivial bugs that cost you many automarks).
* Create a merge request for this branch, and take note of merge request ID in the URL
  * It is the number at the end of the URL
  * "https://nw-syd-gitlab.cseunsw.tech/DPST1093/24T3/groups/T15A_DESSERT/project-backend/-/merge_requests/**67**"
* Request a re-run on the 're-run request' channel of MS-TEAMS for this course
* Once you request it, it may take up to 72 hours for you to receive the results of the rerun.
  

Please note: The current limit on reruns is **once each week per group**.

##### What constitutes a "trivial fix”?
* Fixing spelling/capitalisation/naming issues with values specified in spec documentation
* Swapping a variable type e.g. token from 'number' to 'string'
* Changing the return value type e.g. returning {} rather than null, to match spec documentation
* Changing route versions e.g. v1 to v2 to match spec documentation
* Fixing import values
* Fixing a regex/logical equality check e.g. num === 0 to num === 1
* Fixing constant variable values e.g. loginAttempts = 1 to loginAttempts = 0
* As a general rule, any change that is < 3 lines of code

### 🌸 6.2. Demonstration

The demonstrations in weeks 5,9 and 12 will take place during your lab sessions. All team members **must** attend these lab sessions. Team members who do not attend a demonstration may receive a mark of 0 for that iteration. If you are unable to attend a demonstration due to circumstances beyond your control, you must apply for special consideration.

Demonstrations consist of a 15-20 minute Question and Answer session in front of your tutor.

## 👌 7. Individual Contribution

The marks given to you for each iteration are given to you individually. We do however use group marks (e.g. automarking) to infer this, and in many cases, you may receive the same mark as your group members, particularly in cases with well functioning groups. Your individual mark is determined by a combination of the factors below by your tutor, with your group mark as a reference point.Your tutor will look at the following items each iteration to determine your mark:
 * Project check-in
 * Code contribution
 * Tutorial contributions
 * Peer assessment

### 👌 7.1. Project check-in

During your lab class, you and your team will conduct a short standup in the presence of your tutor. Each member of the team will briefly state what they have done in the past week, what they intend to do over the next week, and what issues they have faced or are currently facing. This is so your tutor, who is acting as a representative of the client, is kept informed of your progress. They will make note of your presence and may ask you to elaborate on the work you've done.

Project check-ins are also excellent opportunities for your tutor to provide you with both technical and non-technical guidance.

Your attendance and participation at project check-ins will contribute to your individual mark component for the project. In addition, your tutor will note down any absences from team-organised standups.

These are easy marks. They are marks assumed that you will receive automatically, and are yours to lose if you neglect them.

The following serves as a baseline for expected progress during project check-ins, in the specified weeks. For groups which do not meet this baseline, teamwork marks and/or individual scaling may be impacted.
| Iteration | Week/Check-in | Expected progress                                                                                                                                     |
| --------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0         | **Week 2**    | Twice-weekly standup meeting times organised, iteration 0 specification has been discussed in a meeting, at least 1 task per person has been assigned |
| 1         | **Week 3**    | Iteration 1 specification has been discussed in a meeting, broken down in Sprint 1 and Sprint 2 as per tutorial. At least 1 task (including tests if applicable) for Sprint 1 complete and plan to finish all Sprint 1 tasks |
| 1         | **Week 4**    | All Sprint 1 tasks complete, All tests complete, At least 1 Sprint 2 function complete per person |
| 2         | **Week 5**    | Iteration 2 specification has been discussed in a meeting, Overall Sprint planning targets have been completed|
| 2         | **Week 6**    | **Two checkins per week - a remote checkin on Monday, an in-person checkin on Thursday** HTTP Tests complete for all server functions and HTTP function stubs complete plus helper functions logic has been completed |
| 2         | **Week 7**    | **There will be two remote checkins during week 7** Server routes complete and all blocker function tests and logic complete |
| 2         | **Week 8**    | **Two checkins per week - a remote checkin on Monday, an in-person checkin on Thursday** All tests and logic for remaining functions complete |
| 3 | **Week 9** | Iteration 3 specification has been discussed in a meeting, Sprint planning is complete, Iteration 2 fixes are done |
| 3         | **Week 10**    | Exceptions & tokens in HTTP headers added across the project, all HTTP Tests and HTTP function stubs are in master. All helper and blocking function logic is completed.
| 3         | **Week 11**    | All tests and logic for remaining function complete |
| 3         | **Week 12** | Project Exhibition in Monday Lecture time, Project Demonstration on Tuesday |

### 👌 7.2. Tutorial contributions

From weeks 2 onward, your individual project mark may be reduced if you do not satisfy the following:
* Attend all tutorials.
* Participate in tutorials by asking questions and offering answers.

We're comfortable with you missing or disengaging with 1 tutorial per term, but for anything more than that please email your tutor. If you cannot meet one of the above criteria, you will likely be directed to special consideration.

These are easy marks. They are marks assumed that you will receive automatically, and are yours to lose if you neglect them.

### 👌 7.3. Code contribution

All team members must contribute code to the project to a generally similar degree. Tutors will assess the degree to which you have contributed by looking at your **git history** and analysing lines of code, number of commits, timing of commits, etc. If you contribute significantly less code than your team members, your work will be closely examined to determine what scaling needs to be applied.

Note that **contributing more code is not a substitute for not contributing documentation**.

Please also note that **failure to commit (as an individual) at least once in each week of your iteration may result in up to a 20% mark penalty**. It's critical that you at least demonstrate you can make minor progress each week. If this were an individual assignment we would not enforce this, but given it is a group assignment it's important we encourage you to commit regularly.

### 👌 7.4. Documentation contribution

All team members must contribute documentation to the project to a generally similar degree.

In terms of code documentation, your functions are required to contain comments in JSDoc format, including paramters and return values:

```javascript
/**
  * <Brief description of what the function does>
  * 
  * @param {data type} name - description of paramter
  * @param {data type} name - description of parameter
  * ...
  * 
  * @returns {data type} - description of condition for return
  * @returns {data type} - description of condition for return
*/
```

In each iteration you will be assessed on ensuring that every relevant function in the specification is appropriately documented.

In terms of other documentation (such as reports and other notes in later iterations), we expect that group members will contribute equally.

Note that, **contributing more documentation is not a substitute for not contributing code**.

### 👌 7.5. Peer Assessment

**Please note: Failure to complete a peer review for a particular iteration may result in a mark penalty of 10% for the iteration**

At the end of each iteration, there will be a peer assessment survey where you will rate and leave comments about each team member's contribution to the project up until that point. 

Your other team members will **not** be able to see how you rated them or what comments you left in either peer assessment. If your team members give you a less than satisfactory rating, your contribution will be scrutinised and you may find your final mark scaled down (after review by your tutor).

The following criteria will be assessed by your team members:
* **Participation**: What was the level of participation in group work, attendance at meetings, making suggestions, taking responsibility for tasks, being in communication with the team?
* **Dependability**: How dependable was this team member in delivering assigned tasks, on time, with expected levels of quality? 
* **Team Wellbeing**: How much did this team member contribute to the healthy functioning of the team by communicating with members, coordinating meetings, listening to concerns, facilitating discussion, offering suggestions?
* **Work contribution**: How much did this team member contribute to the development of the major project. .

<table>
  <tr>
    <th>Iteration</th>
    <th>Link</th>
    <th>Opens</th>
    <th>Closes</th>
  </tr>
  <tr>
    <td>1</td>
    <td>[Peer Review Iteration 1](https://forms.office.com/r/DvMQC3RsJw)</td>
    <td>Fri 10am, 20th Sep</td>
    <td>Tues 9am, 24th Sep</td>
  </tr>
  <tr>
    <td>2</td>
    <td>[Peer Review Iteration 2](https://forms.office.com/r/1QaGPT40AZ)</td>
    <td>Fri 10am, 18th Oct</td>
    <td>Tues 9am, 22th Oct</td>
  </tr>
  <tr>
    <td>3</td>
    <td>[Peer Review Iteration 3](https://forms.office.com/r/Qw7iNfzbJt)</td>
    <td>Fri 10am, 6th Nov</td>
    <td>Tues 9am, 10th Nov</td>
  </tr>
</table>

### 👌 7.6. Managing Issues

When a group member does not contribute equally, we are aware it can implicitly have an impact on your own mark by pulling the group mark down (e.g. through not finishing a critical feature), etc.

The first step of any disagreement or issue is always to talk to your team member(s) on the chats in MS Teams. Make sure you have:
1. Been clear about the issue you feel exists.
2. Been clear about what you feel needs to happen and in what time frame to feel the issue is resolved.
3. Gotten clarity that your team member(s) want to make the change.

If you don't feel that the issue is being resolved quickly, you should escalate the issue by talking to your tutor with your group in a project check-in, or alternatively by emailing your tutor privately outlining your issue.

It's imperative that issues are raised to your tutor ASAP, as we are limited in the mark adjustments we can do when issues are raised too late (e.g. we're limited with what we can do if you email your tutor with iteration 2 issues after iteration 2 is due).

## 💻 8. Automarking & Leaderboard

### 💻 8.1. Automarking

Each iteration consists of an automarking component. The particular formula used to calculate this mark is specific to the iteration (and detailed above).

When running your code or tests as part of the automarking, we place a 120 second timer on the running of your group's tests. This is more than enough time to complete everything unless you're doing something very wrong or silly with your code. As long as your tests take under 120 seconds to run, you don't have to worry about it potentially taking longer when we run automarking.

### 💻 8.2. Pre-submission Leaderboard

In the days preceding iterations 1, 2, and 3's due date, we will be running your code against the actual automarkers (the same ones that determine your final mark) and publishing the results of every group on the automarking page. You will receive a link to the automarking page from your tutor in week 4. You will get to see the current mark (within a range) of your submission, as well as how your group ranks within the cohort. You will not receive any elaboration on how that mark was determined - if your mark isn't what you expect, work with your group and/or tutor to debug your code and write more tests.

You must have the code you wish to be tested in your `master` branch by **10pm** the night before leaderboard runs.

For Iteration 1, the Leaderboard will be updated on Tuesday, Wednesday, Thursday of Week 4.
For Iteration 2, the Leaderboard will be updated on Wednesday, Thursday, Friday of Week 7 and Monday to Thursday of Week 8.
For Iteration 3, the Leaderboard will be run every 6 hours starting from Monday of Week 11.


This leaderboard run gives you a chance to sanity check your automark (without knowing the details of what you did right and wrong), and is just a bit of fun.

## 👀 9. Plagiarism

The work you and your group submit must be your own work. Submission of work partially or completely derived from any other person or jointly written with any other person is not permitted. The penalties for such an offence may include negative marks, automatic failure of the course and possibly other academic discipline. Assignment submissions will be examined both automatically and manually for such submissions.

Relevant scholarship authorities will be informed if students holding scholarships are involved in an incident of plagiarism or other misconduct.

Do not provide or show your project work to any other person, except for your group and the teaching staff of DPST1093. If you knowingly provide or show your assignment work to another person for any reason, and work derived from it is submitted, you may be penalized, even if the work was submitted without your knowledge or consent. This may apply even if your work is submitted by a third party unknown to you.

Note: you will not be penalized if your work has the potential to be taken without your consent or knowledge.