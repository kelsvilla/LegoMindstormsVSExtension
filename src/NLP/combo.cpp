#include<iostream>
#include<string>
#include<vector>
using namespace std;

int main(){
    vector<string> v1;
    v1.push_back("Increase");
    v1.push_back("Enlarge");
    vector<string> v2;
    v2.push_back("Font");
    v2.push_back("Text");
    vector<string> v3;
    v3.push_back("Size");
    v3.push_back("Scale");
    v3.push_back("Length");

    

for (int i = 0;i<v1.size();i++) {
    string s1 = v1.at(i);
    for (int j = 0;j<v2.size();j++) {
        string s2 = v2.at(j);
        for (int k = 0;k<v3.size();k++) {
            string s3 = v3.at(k);
            std::cout << s1 << s2 << s3 << std::endl;
        }
    }
}
}