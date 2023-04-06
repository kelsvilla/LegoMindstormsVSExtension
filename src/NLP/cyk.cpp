#include <iostream>
#include <vector>
#include <fstream>
#include "ECR.cpp"

#define COUNT 10
using namespace std;
class Node
{
private:
    char symbol;
    Node *left;
    Node *right;

public:
    Node *getLeft()
    {
        return left;
    }
    Node *getRight()
    {
        return right;
    }
    char getSymbol()
    {
        return symbol;
    }
    void setLeft(Node *l)
    {
        left = l;
    }
    void setRight(Node *r)
    {
        right = r;
    }
    void setSymbol(char s)
    {
        symbol = s;
    }
    Node(char sym)
    {
        symbol = sym;
        left = nullptr;
        right = nullptr;
    }
};
void print2DUtil(Node* root, int space)
{
    // Base case
    if (root == NULL)
        return;
 
    // Increase distance between levels
    space += COUNT;
 
    // Process right child first
    print2DUtil(root->getRight(), space);
 
    // Print current node after space
    // count
    std::cout << endl;
    for (int i = COUNT; i < space; i++)
        cout << " ";
    std::cout << root->getSymbol() << "\n";
 
    // Process left child
    print2DUtil(root->getLeft(), space);
}
 
int s2i(string states, char state)
{
    for (int i = 0; i < states.size(); i++)
        if (states[i] == state)
            return i;
    return -1;
}
void levelWiseTree(vector<vector<Node*> > &tree, vector<Node*> currLevelNodes)
{
   if (currLevelNodes.size() == 0)
   return;
   tree.push_back(currLevelNodes);
    vector<Node*> nextLevelNodes;
    Node* left;
    Node* right;
    for(int x =0;x<currLevelNodes.size();x++)
    {
        left = currLevelNodes.at(x)->getLeft();
        right = currLevelNodes.at(x)->getRight();
        if (left!=nullptr)
        nextLevelNodes.push_back(left);
        if (right!=nullptr)
        nextLevelNodes.push_back(right);


    }
    levelWiseTree(tree,nextLevelNodes);
  


}

void printTraceBack(vector<vector<vector<int> > > traceback)
{
    for (int x = 0; x < traceback.size(); x++)
    {
        for (int i = 0; i < traceback.at(x).size(); i++)
        {
            for (int j = 0; j < traceback.at(x).at(i).size(); j++)
            {
                cout << traceback.at(x).at(i).at(j) << " ";
            }
            cout << endl;
        }
    }
}
vector<vector<int> > getchildren(vector<vector<vector<int> > > traceback, vector<int> traceRow)
{
    for (int i = 0; i < traceback.size(); i++)
    {
        if (traceback.at(i).at(0) == traceRow)
        {
            return traceback.at(i);
        }
    }
}

void Tree(Node* root, vector<vector<int> > triplet, string input,string states,vector<vector<vector<int> > > traceback)
{
    //if left child generates terminal character
    
    if(triplet.at(1).at(0)==0){
        Node* leftChild = new Node(states[triplet.at(1).at(2)]);
        root->setLeft(leftChild);
        Node* leaf = new Node(input[triplet.at(1).at(1)]);
        leaf->setLeft(nullptr);
        leaf->setRight(nullptr);
        leftChild->setLeft(leaf);
        leftChild->setRight(nullptr);
        
    }
    
     if(triplet.at(2).at(0)==0){
        Node* rightChild = new Node(states[triplet.at(2).at(2)]);
        Node* leaf = new Node(input[triplet.at(2).at(1)]);
        leaf->setLeft(nullptr);
        leaf->setRight(nullptr);
        root->setRight(rightChild);
        rightChild->setLeft(leaf);
        rightChild->setRight(nullptr);

        
        
    }
     if (triplet.at(1).at(0)!=0){

        Node* leftChild = new Node(states[triplet.at(1).at(2)]);
        root->setLeft(leftChild);
        
        Tree(leftChild,getchildren(traceback,triplet.at(1)),input,states,traceback);
        
       

        
    }

    //if right child generates terminal character
   
    if(triplet.at(2).at(0)!=0){
        Node* rightChild = new Node(states[triplet.at(2).at(2)]);
        root->setRight(rightChild);
        Tree(rightChild,getchildren(traceback,triplet.at(2)),input,states,traceback);
    
    }
    return;
    
    
}
void printTable(bool ***table, int loi, int los)
{
    for (int i = 0; i < loi; i++)
    {
        cout << "table : " << i << endl;
        for (int j = 0; j < loi; j++)
        {
            for (int k = 0; k < los; k++)
            {
                cout << table[i][j][k] << " ";
            }
            cout << endl;
        }
        cout << endl;
    }
}

bool*** cyk(vector<string> input, char **rules, int n_rules,string states,vector<vector<vector<int> > > &trace_back,vector<string> &gramaticalKnowledge)
{
    int loi = input.size();
    int los = states.size();
    bool ***table = new bool **[loi];
   

    for (int i = 0; i < loi; i++)
    {
        table[i] = new bool *[loi];
        for (int j = 0; j < loi; j++)
        {
            table[i][j] = new bool[los];
            for (int k = 0; k < los; k++)
                table[i][j][k] = false;
        }
    }
  
    string verb = "";
    string noun = "";
    string adjective = "";
    for (int i = 0; i < loi; i++)
        for (int j = 0; j < n_rules; j++)
        {   
            string rule = string(rules[j] + '\0');
            if (rule.substr(2,rule.length()-1) == input.at(i))
            {
                //cout<<"rule and state matched"<<endl;
                int state_id = s2i(states, rule[0]);
                table[0][i][state_id] = true;
                if (state_id==2){
                     verb = input.at(i);
                     cout<<"verb: "<<verb<<endl;
                }
                else if(state_id==1){
                     noun = input.at(i);
                     cout<<"noun: "<<noun<<endl;
                }
                //fill up other parts of speech for nlu
                else if(state_id == 8){
                    adjective = input.at(i);
                    cout<<"adjective: "<<adjective<<endl;
                }
            }
        }
    
    vector<int> triplets1;
    vector<int> triplets2;
    vector<int> triplets3;
    vector<vector<int> > tripletRow;
    for (int i = 1; i < loi; i++)
        for (int j = 0; j < (loi - i); j++)
            for (int p = 0; p < i; p++)
                for (int k = 0; k < n_rules; k++)
                {
                    int state_id1 = s2i(states, rules[k][0]);
                    int state_id2 = s2i(states, rules[k][2]);
                    int state_id3 = s2i(states, rules[k][3]);
                    if (state_id3 == -1)
                        continue;
                    if (table[p][j][state_id2] and table[i - p - 1][j + p + 1][state_id3])
                    {
                        triplets1.push_back(i);
                        triplets1.push_back(j);
                        triplets1.push_back(state_id1);

                        triplets2.push_back(p);
                        triplets2.push_back(j);
                        triplets2.push_back(state_id2);

                        triplets3.push_back(i - p - 1);
                        triplets3.push_back(j + p + 1);
                        triplets3.push_back(state_id3);

                        tripletRow.push_back(triplets1);
                        tripletRow.push_back(triplets2);
                        tripletRow.push_back(triplets3);
                        trace_back.push_back(tripletRow);

                    
                        table[i][j][state_id1] = true;
                        triplets1.clear();
                        triplets2.clear();
                        triplets3.clear();
                        tripletRow.clear();
                    }
                }

    if (table[loi - 1][0][0]){
        //printTable(table,loi,los);
        gramaticalKnowledge.push_back(verb);
        gramaticalKnowledge.push_back(noun);
        gramaticalKnowledge.push_back(adjective);
        return table;
        }
    else
        {
        cout<<"Invalid Command."<<endl;
        return nullptr;
        
        }
    
}
vector<string> processInput(string input){
    vector<string> separetedInput;
    int start = 0;
    string delim = " ";
    int end = input.find(delim);
    while (end != -1) {
        separetedInput.push_back(input.substr(start, end - start));
        //cout << input.substr(start, end - start) << endl;
        start = end + delim.size();
        end = input.find(delim, start);
    }
    //cout << input.substr(start, end - start);
    separetedInput.push_back(input.substr(start, end - start));
    return separetedInput;
}


/*vector<string> buildCommand(vector<string> gramaticalKnowledge){
        string verb = gramaticalKnowledge.at(0);
        string noun = gramaticalKnowledge.at(1);
        if (gramaticalKnowledge.size()==3){
            string adjective = gramaticalKnowledge.at(2);
            return verb + noun + adjective;
         }
        else
        return verb + noun; 
}*/
int main(int argc, char *argv[])
{
    cout<<"argc: "<<argc<<endl;
    cout<<"argv"<<argv[0]<<endl;
    vector<vector<vector<int> > > traceback;
    
    ECR ecr;
    //std::ifstream infile("test.txt");  
    string input = argv[1];
    for (int i = 2; i< argc;i++){
        
        input = input + " " +argv[i];
    }
    cout<<"input: "<<input<<endl;
    vector<string> separetedInput = processInput(input);
    
    char *rules[48] = {
        //terminals [part of speech]
        "N=font","N=line","N=character","N=class","N=hub","N=editor","N=whitespace","N=theme","N=webview","N=keybinds",
        "N=scope","N=word","N=indentations","N=spaces","N=whitespace",//nouns
        "V=increase","V=decrease","V=go","V=select","V=start","V=open","V=delete","V=change","V=connect","V=reset","V=get","V=update","V=edit",//verbs
        "A=last", "A=first","A=latest","A=current","A=new","A=under","A=leading",//adjective
        "D=the","D=a",//determinators
        "J=size","J=scale","J=number",//adverb [restricted to a single lenght states/symbols. update cyk to accept multi length variables ]
        //non terminals 

        //input: 'select the first line'
        //V ->select
        //D -> the
        //A -> first
        //N -> line
        
        "S=VP",//verb phrase [select][the first line]
        "S=VN",//to deal with direct commands, eg: [select line], we assume that the user is talking about the current line
                //eg: [change theme], we assume the user is talking about the current theme.
                //deal with this in NLU.
        "S=VB",
        "P=DP",//phrase -> [the] [first line]
        "P=AN",//reduced to cnf, X = [first][line]
        "P=DB",
        "P=AB",
        "B=NJ",
         };

    int n_rules = 48;
    string states = "SNVADPXBJ";
    vector<string> gramaticalKnowlegde;
    bool*** table = cyk(separetedInput, rules, n_rules, states,traceback,gramaticalKnowlegde);
    if(table){
    cout<<"The command is syntactically correct."<<endl;
    
    bool semantically_valid = ecr.symanticAnalysis(gramaticalKnowlegde);
    
    if(semantically_valid){
        cout<<"The command is semantically correct."<<endl<<endl;
        cout<<"gramatical knowledge: "<<endl;
        for(int x = 0;x<gramaticalKnowlegde.size();x++)
        {
            cout<<"   "<<gramaticalKnowlegde.at(x)<<endl;
        }
        /*string possible_command = buildCommand(gramaticalKnowlegde);
        cout<<"Possible Command: "<<possible_command<<endl;

          ofstream myfile;
          myfile.open ("example.txt");
          myfile << possible_command;
          myfile.close();
          return 0;
        }*/
    
    }
    }
    return 0;

}
