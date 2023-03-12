#include<string>
#include<vector>
#include<iostream>
#include <fstream>
using namespace std;
class ECR{
    private:
     vector<vector<string> > ecr;
     vector<vector<string> > VA_relationship; //verb adjective relationship
     vector<vector<string> > synonyms;
   
    public:
    void test(string collectionName, vector<vector<string> > collection)
    {
        cout<<"Collection: "<<collectionName<<endl;
        for(int x = 0;x<collection.size();x++)
        {
            cout<<collection.at(x).at(0)<<" : ";
            for(int y = 0; y < collection.at(x).size(); y ++)
            {
                cout<<collection.at(x).at(y)<<" ";
            }
            cout<<endl;
        }
        cout<<endl;
        cout<<"----------------------------------------------"<<endl;
    }
    void init(string relfileName, vector<vector<string> >& relationshipModel)
    {
        string input;
        std::ifstream infile(relfileName);
        while (std::getline(infile, input))
        {
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
        // cout << input.substr(start, end - start)<<endl;
            separetedInput.push_back(input.substr(start, end - start));
            relationshipModel.push_back(separetedInput);
        }
        infile.close();
    
    }
   
    ECR()
    {
        init("verb_noun_rel.txt",ecr);
        init("verb_adjective_rel.txt",VA_relationship);
        init("synonyms.txt",synonyms);

        cout<<"test: "<<endl;
        test("Verb Noun Relationship",ecr);
        test("Verb Adjective Relationship",VA_relationship);
        test("Synonyms",synonyms);
    }
    bool symanticAnalysis(vector<string> gramaticalKnowledge)
    {
        bool valid = true;
        for(int i=0;i<ecr.size();i++)
        {
            if(ecr.at(i).at(0)==gramaticalKnowledge.at(0))
            {

                for(int j = 1;j<ecr.at(i).size(); j++)
                {
                    if(ecr.at(i).at(j)==gramaticalKnowledge.at(1))
                    {
                        cout<<gramaticalKnowledge.at(1)<<" is related to "<<gramaticalKnowledge.at(0)<<endl;
                        
                        break;
                        
                    }
                    else
                    valid = false;
            
                }

            }
        }
        for(int i=0;i<VA_relationship.size();i++)
        {
            if(VA_relationship.at(i).at(0)==gramaticalKnowledge.at(0))
            {
                for(int j = 1;j<ecr.at(i).size(); j++)
                {
                    if(VA_relationship.at(i).at(j)==gramaticalKnowledge.at(2))
                    {
                        cout<<gramaticalKnowledge.at(2)<<" is related to "<<gramaticalKnowledge.at(0)<<endl;   
                        break;     
                    }
                    else
                    valid = false;            
                }
            }
        } 
        return valid;
    
  }

};


    
