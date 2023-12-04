import nltk
from nltk.corpus import brown, verbnet, wordnet
from nltk.chunk.regexp import *
import colorama
from nltk.stem import PorterStemmer,LancasterStemmer
from nltk.stem import WordNetLemmatizer
import json

class NaturalLanguageProcessor:
    def __init__(self):
        self.parse_package()
        self.load_syns()
        self.parse_commands()

    def parse_package(self):
        with open('package.json') as packageFile:
            self.commands = json.load(packageFile)['contributes']['commands']

    def parse_commands(self):
        if not self.commands:
            raise ValueError("Commands is empty.")

        self.parsed_commands = []
        for command in self.commands:
            entities, actions, prepositions = self.entity_action_recognizer(command['title'])
            self.parsed_commands.append({
                "entities": entities,
                "actions": actions,
                "prepositions": prepositions
            })

    def identify_command2(self, entities, actions, preposition):
        # print(colorama.Fore.CYAN+'*** Searching for command to run.')
        #print(colorama.Fore.BLUE +'Entities received [cmd_entities]: ',entities)
        # print(colorama.Fore.BLUE +'Actions received [cmd_actions]: ',actions)
        stemmer = PorterStemmer()
        entity_match = set()
        action_match = set()
        command_index = 0
        if preposition == '':
            #print(colorama.Fore.CYAN +'Single Entity Command')
            for i, command in enumerate(self.parsed_commands):
                #print(f"{command['title']}\nEntities: {ext_entities}\nActions:{ext_actions}\nPrepositions:{ext_prepositional}", flush=True)
                if(len(command["entities"])!=0 and len(command["actions"])!=0):
                    if command["prepositions"] == '' and entities[0]==command["entities"][0]:
                        #print(colorama.Fore.GREEN +' - Entity Matched with command [ ',command['title'],' ] at index ',i)
                        entity_match.add(i)
                    if actions == command["actions"]:
                        #print(colorama.Fore.GREEN +' - Action matched with command [ ',command['title'],' ] at index ',i)
                        action_match.add(i)
            #print(colorama.Fore.GREEN +'Entities Matched Command Indexs: ',entity_match)
            #print(colorama.Fore.GREEN +'Action Matched Command Indexs: ',action_match)

            similar = list(action_match.intersection(entity_match))
            #print(colorama.Fore.GREEN +'Similar: ',similar)
            if len(similar) == 1:
                return self.commands[similar[0]]['command'],stemmer.stem(''.join(actions))+'ing ' + ' '.join(entities)
            #print('command not recognized.')
            return 'NULL','NULL'
        else:
            #print(colorama.Fore.CYAN +'Multi Entity Command. Preposition: ',preposition)
            for i in self.commands:
                ext_entities,ext_actions,ext_prepositional = self.entity_action_recognizer(i['title'])
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
            #print(colorama.Fore.CYAN +'Entities Matched Command Indexs: ',entity_match)
            #print(colorama.Fore.CYAN +'Action Matched Command Indexs: ',action_match)

            similar = list(action_match.intersection(entity_match))
            #print(colorama.Fore.GREEN +'Similar: ',similar)
            if len(similar) == 1:
                return self.commands[similar[0]]['command'],stemmer.stem(''.join(actions)) + 'ing ' + ' '.join(entities)
            #print('command not recognized.')
            return 'NULL','NULL'

    """checks if the provided command entities are listed as a synonym of the root words 
        used in extension commands title"""
    def alternatives(self, entities):
        lemmatizer = WordNetLemmatizer()
        token_syns = []
        #This for loop is currently pointless, as entities is always a 1-length list
        for word in entities:
            #print(f"word: {word}")
            tokens = nltk.word_tokenize(word)
        
        for token in tokens:
            root_found = False #root word for a token found
            roots= []
            for syn_row in self.syns:
                for registerd_synonym in syn_row:
                    if lemmatizer.lemmatize(registerd_synonym)==lemmatizer.lemmatize(token):
                        root_found = True
                        roots.append(lemmatizer.lemmatize(syn_row[0]))
            if root_found == False:
                roots.append('')
            token_syns.append((token,roots))
        print(token_syns)
        return token_syns #return the token and their roor words

    def load_syns(self):
        with open("syns.txt", "r", newline='\n') as f:
            lines = f.readlines()
            self.syns = []
            for line in lines:
                nl =line.rstrip('\n').split(',')
                self.syns.append(nl)

    def entity_action_recognizer(self, sentence):
        #python_specific_entities = ['for loop','while loop','for number loop','nested for loop','if else ladder','if ladder','nested for number loop','try ladder']
        sentence = "can you " + sentence.lower() #"Can you" is presumably prepended to lead the tagger towards more correctly tagging verbs
        tokens = nltk.word_tokenize(sentence)
        default_pos_tags = nltk.pos_tag(tokens)

        #Used to identify phrases that normally wouldn't be chunked
        programming_keywords = {
            "KP": ["for", "loop", "while", "number", "nested", "if", "else", "ladder", "try"],
        }
        #Scan text for these phrases like "for loop" to retag them to be identified as a single entity
        for i, text_tag_tuple in enumerate(default_pos_tags):
            for tag in programming_keywords.keys():
                for word in programming_keywords[tag]:
                    if text_tag_tuple[0] == word:
                        default_pos_tags[i] = (word, tag)

        #print(f"tags: {default_pos_tags}", flush=True)
        lemmatizer = WordNetLemmatizer()

        grammar_np = r"""
                        Entity: {<KP><KP>+}
                        Entity: {<VBG><NN|KP>}
                        Entity: {<VBG><NNS|KP>}
                        Entity: {<VBN><NN|KP>}
                        Entity: {<VBN><NNS|KP>}
                        Entity: {<VBD><NN|KP>}
                        Entity: {<VBG><NNS|KP>}
                        Entity: {<JJ><NN+|KP>}
                        Entity: {<NN><NN|NNS|KP>*}
                        Entity: {<NNS|KP>}
                        Entity: {<NN|KP>}
                        
                        
                        MultiEntity: {<Entity><IN><Entity>}
                        MultiEntity: {<Entity><IN><DT><Entity>}
                        Action: {<VB>}              
                    """
        chunk_parser = nltk.RegexpParser(grammar_np)
        chunk_result = chunk_parser.parse(default_pos_tags)
        #print(f"Chunk Result for {sentence}: \n{chunk_result}\n",flush=True)
        entities = []
        for subtree in chunk_result.subtrees(filter=lambda t: t.label() == 'Entity'):
            entity = []
            for item in subtree:
                entity.append(lemmatizer.lemmatize(item[0]))
            entities.append(' '.join(entity))
        actions = []
        for subtree in chunk_result.subtrees(filter=lambda t: t.label() == 'Action'):
            for item in subtree:
                actions.append(item[0])
        preposition = ''
        for subtree in chunk_result.subtrees(filter=lambda t: t.label() == 'MultiEntity'):
            if len(subtree)!=0:
                preposition = subtree[1][0]
        return entities,actions, preposition

    def buildEntities(self, root_entities):
        #print('--building entities')
        combinations = []
        #print('Root Entities: ',root_entities)
        #root entities eg: ( (font,['word','text]),(size,['scale','length']), where [word,text] are root words for 'font
        if len(root_entities)>=2: #multi worded entity
            prefix_ent,pre_root = root_entities[0]
            post_ent,post_root = root_entities[1]
            for i in range(0,len(pre_root)):
                for j in range(0,len(post_root)):
                    combinations.append(pre_root[i]+ ' ' +post_root[j])
        elif len(root_entities)==1:
            prefix_ent,pre_root = root_entities[0]
            for i in range(0,len(pre_root)):
                combinations.append(pre_root[i])
        # elif len(root_entities)==0:
        #     combinations.append()
        #print('combos: ',combinations)
        return combinations


# def test():
#     # f = open('pos.txt','w')
#     syns = syns_load()
#     packageFile = open('package.json')
#     package = json.load(packageFile)

#     for i in package['contributes']['commands']:
#         cmd = 'can you '+i['title']
#         print('command: ',cmd)
#         entities,actions,preposition = entity_action_recognizer(cmd,True)
#         print("Entities: ",entities,' Actions:',actions, 'Preposition: ',preposition)
#         known_entities = []
#         new_entities = []
#         for entity in entities:
#             known_entities.append((entity,alternatives(syns,[entity])))
#         for knw_ents in known_entities:
#             #print('Known Entities after searching for root words: ',knw_ents[1])
#             new_entities.append(knw_ents[1])
#         #if root word for all the words describing an entity of are found
#         # print(identify_command2(new_entities,actions,preposition))
# def syn_test(sentence):
#     from nltk.corpus import wordnet
#     syns = syns_load()
#     sentence = sentence.lower()
#     tokens = nltk.word_tokenize(sentence)
#     action = '' # only one verb per command ? change if accepting multiple commands
#     default_pos_tags = nltk.pos_tag(tokens)
#     print(default_pos_tags)
#     entities,actions,preposition = entity_action_recognizer(sentence,True)
#     print("Entities: ",entities,' Actions:',actions, 'Preposition: ',preposition)
#     new_entities = []
#     for entity in entities:
#         new_entities.append(buildEntities(alternatives(syns,[entity])))
#     print('entities to try with : ',new_entities)
#     if preposition == '':
#         print('Single Entity Command')
        
#         new_entitis = new_entities[0]
#         for new_entity in new_entitis:
#             print('Trying with : ',new_entity)
#             cmd,msg = identify_command2([new_entity],actions,preposition)
#             if cmd!='NULL':
#                 print(msg)
#                # break
#     else:
#         print('Multy Entity Command')
#         new_entitis = []
#         preceding_ents = new_entities[0]
#         trailing_ents = new_entities[1]
#         for i in range(0,len(preceding_ents)):
#             for j in range(0,len(trailing_ents)):
#                 new_entitis.append([preceding_ents[i],trailing_ents[j]])
#         for new_ents in new_entitis:
#             print('Trying with :',new_ents)
#             cmd,msg = identify_command2(new_ents,actions,preposition)
#             if cmd != 'NULL':
#                 print(msg)
#                 break

# def tag_keyphrase(tokens):
#     pass
        
#test()
# cmds = ['can you increase the texts size','can you get the texts under the cursor','can you insert a for loop']
# for cmd in cmds:
#     syn_test(cmd)
#     print('-------------------------------------------')
#     print()
