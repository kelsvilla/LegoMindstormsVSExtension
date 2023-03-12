/*
usage check if the syntactically and semantically correct commands can be correctly identified and called
given a list of registered commands. 
*/
#include<fstream>
#include<iostream>
#include<string>
#include<vector>
using namespace std;

void interface(string registeredCommandsFileName,vector<string> gramaticalKnowledge)
{
//file handling 
string input;
vector<string> commands;
std:: ifstream infile(registeredCommandsFileName);
while(std::getline(infile,input))
{
    cout<<input<<endl;
    commands.push_back(input);
    
}
infile.close();
//collect registed commands from the file
}
int main()
{
    vector<string> gramaticalKnowledge;
    gramaticalKnowledge.push_back("Increase");
    gramaticalKnowledge.push_back("Font");
    gramaticalKnowledge.push_back("Scale");

    interface("registerdCommands.txt",gramaticalKnowledge);

}