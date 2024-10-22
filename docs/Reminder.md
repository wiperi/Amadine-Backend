# Tips
Since we are going to work together in next 11 weeks, there will be some tips for us to improve our workflow.
## What is a good question
### Ask Question
The first step of being a good programmer and learner is know how to ask questions properly. I am lately learning project [一生一芯(YSYX)](https://ysyx.oscc.cc/). The very fist thing in pre-learning period is to read [How To Ask Questions The Smart-Way (Chinese based)](https://github.com/ryanhanwu/How-To-Ask-Questions-The-Smart-Way/blob/main/README-zh_CN.md) and [Stop Ask Questions The Stupid Ways](https://github.com/tangx/Stop-Ask-Questions-The-Stupid-Ways/blob/master/README.md). 
You can read through that. I want to clarify that I don't want waste your valuable time or stop you asking questions. What I want is that let my mate know "what is right". When you are willing to make efforts to work on some "Right stuff" and try to ask question in proper way, you have taken first step to your professional journey.
### STFW, RTFM, RTFSC
Just try to understand the meaning of those acronmys in previous articles. You may feel offended by the letter F, but the truth is that the meaning of the letter has never been the point, it's just a reflection of the legend behind the three acronyms that makes them easier to remember.For example, the RTFSC originated with the first sentence of Linus Torvalds, the father of Linux, in a reply to an email dated 1 April 1991.

## Git
By iteration 0 marking criteria,
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
      <li>Completed group contract.</li>
      <li>A generally equal contribution between team members.</li>
      <li>Effective use of course-provided MS Teams for communication, demonstrating an ability to competently manage teamwork online.</li>
      <li>Had a meeting together that involves planning and managing tasks, and taken notes from said meeting (and stored in a logical place in the repo e.g. Wiki section).</li>
    </ul></td>
  </tr>
</table>

We can see that git practices contain 30% marks. I know all of mates have a nice understanding of basic git commands. But there should be good a workflow to improve our consistency and accuracy.
If we have already have a file called `main.js`, I want to add some feature to the file. I will create a branch named(your name_feature name) and work on that branch. After I finish the feature, I will pull first(be updated) and push to my branch remotely. Once I've finished, a merge request should be created in Gitlab. I hope my mates will NOT select yourself as code reviewer. PLEASE do not directly work on master branch and git push to master! Here is the command you should use. 
```shell
STFW
```
## code style
Everyone has his(her) code style, it's fine if the code is clean and tidy. Here is style guide if you want to read [style guide](https://github.com/airbnb/javascript).
For example
```js
function countLeaps(yearArray) {
  var res = 0;
  for(let year of yearArray){if(isLeap(year) == true){res++;}
  } 
  return res;}
```
You will find it's really hard to read
```js
function countLeaps(yearArray) {
  let res = 0;
  for(let year of yearArray){
    if(isLeap(year)){
      res++
    }
  } 
  return res;
}
``` 
Yes, good style can make your life much better. 
## Why I choose to write this MD in English
I know my every teammate is from China, so I can totally write in Chinese. But most of the manuals and papers we read are in English. That why I choose to write it in English.

## Some impressions
I am really happy that you have read through the file. Thanks. I know you have high marks in 1091 (and 1092) and want to get a good mark in 1093. Let's start our journey together. I hope all my teammates can try you best on this teamwork. Dissatisfaction and differences in opinion to co-operate are unavoidable. So if there is anything wrong, please just speak out and solve the problem without your subjective feelings.
