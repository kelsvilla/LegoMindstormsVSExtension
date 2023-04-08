import nltk
from nltk.corpus import brown, verbnet, wordnet
from nltk import grammar
from nltk.chunk.regexp import *

import json
def syns_load():
    f = open("syns.txt", "r",newline='\n')
    lines = f.readlines()
    syns = []
    for line in lines:
        nl =line.rstrip('\n').split(',')
        syns.append(nl)
    return syns

def get_synomymns(syns,words):
    for word in words:
        tokens = nltk.word_tokenize(word)
        print(tokens)
    multi_token_syns = []
    for token in tokens:
        for i in syns:
            for j in i:
                if(j==token) and len(tokens) == 1:
                    return i[0]
                elif j == token:
                    multi_token_syns.append(i[0])
    return ' '.join(multi_token_syns)

def entity_action_recognizer(sentence,prefixed):
    # f = open('pos.txt','a')
    sentence = sentence.lower()
    tokens = nltk.word_tokenize(sentence)
    action = '' # only one verb per command ? change if accepting multiple commands
    default_pos_tags = nltk.pos_tag(tokens)
    # f.write(sentence)
    # f.write('\n')
    # for tok,tag in default_pos_tags:
    #     f.write(tok + ' --> '+tag)
    #     f.write('\n')
    grammar_np = r"""
                    Entity: {<NN><NN>}
                    Entity: {<JJ><NN>+}
                    Entity: {<NNS>}
                    Entity: {<NN>}
                    Entity: {<VBN><NN>}
                    Entity: {<VBN><NNS>}
                    Entity: {<VBG><NN>}
                    Entity: {<VBG><NNS>}
                    Entity: {<VBD><NN>}
                    Entity: {<VBG><NNS>}   
                    Entity: {<NN><NNS>}            
                """
    chunk_parser = nltk.RegexpParser(grammar_np)
    chunk_result = chunk_parser.parse(default_pos_tags)
    entities = []
    for subtree in chunk_result.subtrees(filter=lambda t: t.label() == 'Entity'):
        entity = []
        for item in subtree:
            entity.append(item[0])
        entities.append(' '.join(entity))
    
    #todo deal with verbs later
    verbs = []
    tokens = nltk.word_tokenize(sentence)
    default_pos_tags = nltk.pos_tag(tokens,tagset='universal')
    for tok,tag in default_pos_tags:
        if tag == 'VERB':
            verbs.append(tok)
    
        #multiple verbs??
    if len(verbs) == 2 and prefixed:
        action = verbs[1]
        print(' action: ',action)
    return entities,action
            
#perform pos tags on the current commands list and store them
def identify_command(entities,action):
    f = open("demofile2.txt", "w")
    packageFile = open('package.json')
    package = json.load(packageFile)
    syns = syns_load()
    entity_match = set()
    action_match = set()
    f.write('cmd_entities: '+ ' '.join(entities) + '\n')
    f.write('cmd_action: ' + action + '\n')
    f.write('-----Comparision with ext --- \n')
    command_index = 0
    for i in package['contributes']['commands']:
        ext_entities,ext_action = entity_action_recognizer('can you ' + i['title'],True)
        f.write(i['title'] + '\n')
        f.write(' - Entities: '+ ' '.join(ext_entities)+'\n')
        f.write(' - Action: '+ ext_action)
        f.write('\n')
        entity_found = False
        action_found  = False
        for j in entities:
            for k in ext_entities:
                f.write(' **comparing entities: ' + j + " vs "+k + '\n')
                if(j==k):
                    print(' Entity found in ext commands')
                    f.write(' --entity matched\n')
                    entity_found = True
                    entity_match.add(command_index)
        if action == ext_action:
            f.write(' --Action Matched\n')
            action_found = True
            action_match.add(command_index)
        
        command_index += 1
    packageFile.close()
    similar = list(action_match.intersection(entity_match))
    if len(similar) == 1:
        return package['contributes']['commands'][similar[0]]['command']
    
    #try with synonyms, currently only deals with command with 1 entity recognized
    print('command not recognized, trying with synonyms')
    entity_synonym = get_synomymns(syns,entities)
    if entity_synonym != '':
        return identify_command([entity_synonym],action)
    return 'NULL'

















