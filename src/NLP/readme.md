This project is an experiment to check to what extent we can use context free grammar to build the langugage that the extention understands. The language of this extention will be a subset of natural english language and is limited within the context of the extention, making it perfect to use context free grammar.

Example of the language.
The extention will understand 'Can you run the current program' but will not understand 'Play my favorite music'
The list of commands the grammar should recognize are shared in the [commands.png] file.
The goal of the project is to reduce naturally spoken english to these commands.

The project will use context free grammar for Natural Language Processing, Natural Language Understanding, Natural Language Generation.
NLP :

-   Generate Parse Tree
-   gramatical correctness
-   Speech Tagging
    Tags the most important parts of speech from which we can deduce the semantics of the text.
    In this project just the verb and nouns are tagged. Where verbs are commands and nouns are the entity upon which the command is to be executed.
    For example: select the first line
    select -> verb -> command
    line -> noun -> entity

NLU :

-   Entity Command Relationship
    Even though the commands are syntactically right, their semantics may not be correct. For this I have created a simple file 'ecr.txt'
    representing the relation ships between a command and an entity. A command has a relationship with an entity if those commands can be
    executed upon the entity. The first column of a row is a command and the rest of the colums holds entities that are related to the command.
    Eg: 'select the first line' is a semanticaly valid sentence because there is a relationship between select and line.
    But, 'select the hub' even though gramatically correct does not make sense.

some assumptions about the input:

-   all of the inputs are provided small english character and are separated by a space.
-   inputs does not contain special characters[@#$&,./%""...]

The grammar does not deal with ambiguity. Since this NLP is performed over a very specific domain, the chances of ambuigity is rare.

To Run The Program:
g++ cyk.cpp
./a.out

[test.txt is a file containing various commands that may be given as input and the program determines if the command is syntactically and semantically correct. Provide new inputs in this file.]
