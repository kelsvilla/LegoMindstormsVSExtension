import nltk
from nltk.corpus import brown, verbnet, wordnet
from nltk.chunk.regexp import *
import colorama
from nltk.stem import PorterStemmer,LancasterStemmer
from nltk.stem import WordNetLemmatizer




import json
def syns_load():
    f = open("syns.txt", "r",newline='\n')
    lines = f.readlines()
    syns = []
    for line in lines:
        nl =line.rstrip('\n').split(',')
        syns.append(nl)
    f.close()
    return syns


def get_synomymns(syns,entities):
    #print(colorama.Fore.GREEN+ 'Generating synonyms for: ', entities)
    for word in entities:
        tokens = nltk.word_tokenize(word)
        #print(colorama.Fore.BLUE +' - Tokens : ',tokens)
    multi_token_syns = []
    
    for token in tokens:
        token_found = False #root word for a token found
        for i in syns:
            for j in i:
                if(j==token) and len(tokens) == 1:
                    #print(colorama.Fore.GREEN + ' - Single Entity. Syn :  ',i[0])
                    return i[0]
                elif j == token:
                    multi_token_syns.append(i[0])
    #print(colorama.Fore.GREEN+' - Multi Entity. Syn :  ',' '.join(multi_token_syns))
    return ' '.join(multi_token_syns)

def alternatives(syns,entities):
    #print(colorama.Fore.GREEN+ 'Generating synonyms for: ', entities)
    lemmatizer = WordNetLemmatizer()
    for word in entities:
        tokens = nltk.word_tokenize(word)
        #print(colorama.Fore.BLUE +' - Tokens : ',tokens)
        token_syns = []
    
    for token in tokens:
        root_found = False #root word for a token found
        roots= []
        for syn_row in syns:
            for registerd_synonym in syn_row:
                if lemmatizer.lemmatize(registerd_synonym)==lemmatizer.lemmatize(token):
                    root_found = True
                    print('root found: ')
                    roots.append(lemmatizer.lemmatize(syn_row[0]))
        if root_found == False:
            roots.append('')
        token_syns.append((token,roots))
    #print(colorama.Fore.GREEN+' - Multi Entity. Syn :  ',' '.join(multi_token_syns))
    print(token_syns)
    return token_syns
    # return ' '.join(multi_token_syns)

def entity_action_recognizer(sentence,prefixed):
    
    sentence = sentence.lower()
    tokens = nltk.word_tokenize(sentence)
    action = '' # only one verb per command ? change if accepting multiple commands
    default_pos_tags = nltk.pos_tag(tokens)
    
    lemmatizer = WordNetLemmatizer()

    grammar_np = r"""
                    Entity: {<VBG><NN>}
                    Entity: {<VBG><NNS>}
                    Entity: {<VBN><NN>}
                    Entity: {<VBN><NNS>}
                    Entity: {<VBD><NN>}
                    Entity: {<VBG><NNS>}
                    Entity: {<JJ><NN+>}
                    Entity: {<NN><NN|NNS>*}
                    Entity: {<NNS>}
                    Entity: {<NN>}
                    
                    
                    MultiEntity: {<Entity><IN><Entity>}
                    MultiEntity: {<Entity><IN><DT><Entity>}
                    Action: {<VB>}              
                """
    chunk_parser = nltk.RegexpParser(grammar_np)
    chunk_result = chunk_parser.parse(default_pos_tags)
    entities = []
    for subtree in chunk_result.subtrees(filter=lambda t: t.label() == 'Entity'):
        entity = []
        #print(colorama.Fore.BLUE+'entities: ')
        for item in subtree:
            #print(item)
            entity.append(lemmatizer.lemmatize(item[0]))
        entities.append(' '.join(entity))
    actions = []
    for subtree in chunk_result.subtrees(filter=lambda t: t.label() == 'Action'):
        for item in subtree:
            actions.append(item[0])
    preposition = ''
    #print('Multi entity chunk result',chunk_result.subtrees(filter=lambda t: t.label() == 'MultiEntity'))
    #print(colorama.Fore.CYAN+'Checking if multiple entity commands')
    for subtree in chunk_result.subtrees(filter=lambda t: t.label() == 'MultiEntity'):
        if len(subtree)!=0:
            #print(colorama.Fore.CYAN+' - subtree length: ',len(subtree))
            #print(colorama.Fore.CYAN+' - preposition: ',subtree[1][0])
            preposition = subtree[1][0]
            # for item in subtree:
            #     print(colorama.Fore.CYAN+'Multi Entities :',item[0])
    return entities,actions, preposition

def identify_command2(entities,actions,preposition):
    # print(colorama.Fore.CYAN+'*** Searching for command to run.')
    # print(colorama.Fore.BLUE +'Entities received [cmd_entities]: ',entities)
    # print(colorama.Fore.BLUE +'Actions received [cmd_actions]: ',actions)
    
    stemmer = PorterStemmer()
    packageFile = open('package.json')
    package = json.load(packageFile)
    syns = syns_load()
    entity_match = set()
    action_match = set()
    command_index = 0
    if preposition == '':
        #print(colorama.Fore.CYAN +'Single Entity Command')
        for i in package['contributes']['commands']:
            ext_entities,ext_actions,ext_prepositional = entity_action_recognizer('can you ' + i['title'],True)
            if(len(ext_entities)!=0 and len(ext_actions)!=0):
                if ext_prepositional == '' and entities[0]==ext_entities[0]:
                    #print(colorama.Fore.GREEN +' - Entity Matched with command [ ',i['title'],' ] at index ',command_index)
                    entity_match.add(command_index)
                if actions == ext_actions:
                    #print(colorama.Fore.GREEN +' - Action matched with command [ ',i['title'],' ] at index ',command_index)
                    action_match.add(command_index)
            command_index += 1
        packageFile.close()
        #print(colorama.Fore.GREEN +'Entities Matched Command Indexs: ',entity_match)
        #print(colorama.Fore.GREEN +'Action Matched Command Indexs: ',action_match)

        similar = list(action_match.intersection(entity_match))
        #print(colorama.Fore.GREEN +'Similar: ',similar)
        if len(similar) == 1:
            return package['contributes']['commands'][similar[0]]['command'],stemmer.stem(''.join(actions))+'ing ' + ' '.join(entities)
        print('command not recognized.')
        return 'NULL','NULL'
    else:
        #print(colorama.Fore.CYAN +'Multi Entity Command. Preposition: ',preposition)
        for i in package['contributes']['commands']:
            ext_entities,ext_actions,ext_prepositional = entity_action_recognizer('can you ' + i['title'],True)
            if(len(ext_entities)!=0 and len(ext_actions)!=0):
                if ext_prepositional!='':
                        #print('entities[0]: ',entities[0],ext_entities[0])
                        #print('entities[1]',entities[1],ext_entities[1])
                        if (entities[0] == ext_entities[0] and entities[1] == ext_entities[1]):
                            #print(colorama.Fore.GREEN +' - Entity Matched with command [ ',i['title'],' ] at index ',command_index)
                            entity_match.add(command_index)
                if actions == ext_actions:
                    #print(colorama.Fore.GREEN +' - Action matched with command [ ',i['title'],' ] at index ',command_index)
                    action_match.add(command_index)
            command_index += 1
        packageFile.close()
        #print(colorama.Fore.CYAN +'Entities Matched Command Indexs: ',entity_match)
        #print(colorama.Fore.CYAN +'Action Matched Command Indexs: ',action_match)

        similar = list(action_match.intersection(entity_match))
        #print(colorama.Fore.GREEN +'Similar: ',similar)
        if len(similar) == 1:
            return package['contributes']['commands'][similar[0]]['command'],stemmer.stem(''.join(actions)) + 'ing ' + ' '.join(entities)
        print('command not recognized.')
        return 'NULL','NULL'

#def buildEntities(root_entities):
 #   for root_entity in root_entities:





def test():
    # f = open('pos.txt','w')
    syns = syns_load()
    packageFile = open('package.json')
    package = json.load(packageFile)

    for i in package['contributes']['commands']:
        cmd = 'can you '+i['title']
        print('command: ',cmd)
        entities,actions,preposition = entity_action_recognizer(cmd,True)
        print("Entities: ",entities,' Actions:',actions, 'Preposition: ',preposition)
        known_entities = []
        new_entities = []
        for entity in entities:
            known_entities.append((entity,alternatives(syns,[entity])))
        for knw_ents in known_entities:
            #print('Known Entities after searching for root words: ',knw_ents[1])
            new_entities.append(knw_ents[1])
        #if root word for all the words describing an entity of are found
        # print(identify_command2(new_entities,actions,preposition))
def syn_test(sentence):
    from nltk.corpus import wordnet
    syns = syns_load()
    sentence = sentence.lower()
    tokens = nltk.word_tokenize(sentence)
    action = '' # only one verb per command ? change if accepting multiple commands
    default_pos_tags = nltk.pos_tag(tokens)
    print(default_pos_tags)
    entities,actions,preposition = entity_action_recognizer(sentence,True)
    print("Entities: ",entities,' Actions:',actions, 'Preposition: ',preposition)
    root_entities = []
    new_entities = []
    for entity in entities:
        root_entities.append(alternatives(syns,[entity]))
    print(len(root_entities))
   # buildEntities(root_entities)
#test()
#cmds = ['can you increase the texts size','can you get the texts under the cursor','can you insert a for loop']
#for cmd in cmds:
 #   syn_test(cmd)




        










