import nltk
from nltk.corpus import brown, verbnet, wordnet
from nltk import grammar
import json

def preProcess(sentence,prefixed):
    sentence = sentence.lower()
    tokens = nltk.word_tokenize(sentence)
    action = '' # only one verb per command ? change if accepting multiple commands
    entities = []
    verbs = []
    default_pos_tags = nltk.pos_tag(tokens,tagset='universal')
    print("Sentence: ",sentence)
    print(" Default:\n",default_pos_tags)


    #grouping nouns 
    new_noun = ''
    for i in range(0,len(default_pos_tags)):
        if default_pos_tags[i][1] == 'NOUN':
            new_noun = new_noun + " " + default_pos_tags[i][0]
            if i+1 <= len(default_pos_tags)-1:
                if default_pos_tags[i+1][1] == 'PRT' or default_pos_tags[i+1][1] == 'ADP':
                    entities.append(new_noun)
                    new_noun = ''
            else:
                entities.append(new_noun)
        
        elif default_pos_tags[i][1] == 'VERB':
            verbs.append(default_pos_tags[i][0])
            
    #to do fix no entities, maybe misclassified as other POS
    if len(entities)==0:
        print(' [problem] : no entities')
    else:
        print(' Entities Identified: \n',entities)

    #multiple verbs??
    if len(verbs) ==2 and prefixed:
        action = verbs[1]
        print(' action: ',action)
    elif len(verbs) > 2:
        action = 'confusion'
        print(' [problem]: multiple verbs')
    
    print('-----------------------------------------\n')


    #tagset = []
    
    # token_index = 0
    # for token in tokens:
    #     result = [item for item in brown.tagged_words() if item[0] == token]
    #     unique = set(result)
    #     pos_tags = []
    #     if len(unique) != 0:
    #         for word,tag in unique:
    #             pos_tags.append(tag)
    #     pos_tags.append(default_pos_tags[token_index][1])
    #     token_index = token_index + 1    
    #     tagset.append((token,set(pos_tags)))
    #todo: use default tagset as primary, use brown.tagged_words only when default is not available
    return entities,action



def compare(cmd_tagset,ext_cmd_tagset_list):
    token_match_percent = []
    ext_cmd_index = 0
    for cmd_token,cmd_tok_tags in cmd_tagset:
        for ext_cmd_tagset in ext_cmd_tagset_list:
            matched_tokens = 0
            for ext_cmd_token, ext_cmd_tok_tags in ext_cmd_tagset:
                if cmd_token == ext_cmd_token:
                    matched_tokens += 1
                if matched_tokens == len(cmd_tagset):
                    return ext_cmd_index
            token_match_percent.append((ext_cmd_index,matched_tokens/len(cmd_tagset)*100))
            ext_cmd_index += 1

#perform pos tags on the current commands list and store them
def identify_command(entities,action):
    packageFile = open('package.json')
    package = json.load(packageFile)
    extention_commands_tagset = []
    
    for i in package['contributes']['commands']:
        ext_entities,ext_action = preProcess('can you ' + i['title'],True)
        entity_found = False
        action_matched  = False
        for j in entities:
            for k in ext_entities:
                if(j==k):
                    print('Entity found in ext commands')
                    entity_found = True
        if action == ext_action:
            print('Action Matched')
            action_matched = True
        if entity_found and action_matched:
            return i['command']
    if entity_found== False and action_matched == False:
        print('command not recognized')
    return 'command not recognized'

def test():
    cmd1 = 'can you go to symbol'
    ext_cmd  = 'can you Go to Symbol'
    entity,action = preProcess(cmd1,True)
    ext_entity,ext_action = preProcess(ext_cmd,True)
    print(entity,action)
    print(ext_entity,ext_cmd)











