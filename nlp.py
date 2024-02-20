from typing import TypedDict
import json
import spacy
import string
from spacy.language import Language
from spacy.attrs import LOWER, POS, ENT_TYPE, TAG
from spacy.tokens import Doc, Token
import numpy

class Command(TypedDict):
    command: str
    title: str
    similarity: float

class NaturalLanguageProcessor:
    #Used to create custom taggers, like the one used for identifying code commands
    @Language.factory("keyword_pos_tagger")
    class KeywordPosTagger:
        def __init__(self, name, nlp, keywords, pos_tag):
            self.keywords = keywords
            self.pos_tag = pos_tag
        def __call__(self, doc):
            for token in doc:
                if token.text in self.keywords:
                    token._.pos_tag = self.pos_tag
            return doc
        
    def __init__(self, packageLocation='package.json', langLocation='en_core_web_md'):
        self._packageLocation = packageLocation
        self._nlp = spacy.load(langLocation)
        self._create_tagger()
        self._load_commands()
        self._parse_commands()

    def _load_commands(self):
        with open(self._packageLocation) as packageFile:
            self.commands = json.load(packageFile)['contributes']['commands']
            if not self.commands:
                raise ValueError("Commands is empty.")
            
    def _parse_commands(self):
        self.parsed_commands: list[Doc] = []
        for command in self.commands:
            self.parsed_commands.append(self.remove_tokens_on_match(self._nlp(self.clean_input("can you " + command['title']))))

    def clean_input(self, input):
        clean_string = input.lower()
        clean_string = clean_string.translate(str.maketrans('','', string.punctuation))
        return clean_string
    
    def remove_tokens_on_match(self, doc: Doc):
        indexes: list[int] = []
        for index, token in enumerate(doc):
            if not token.pos_ in ('NOUN', 'PROPN', 'VERB') and not token._.pos_tag in ('CODE',):
                indexes.append(index)
        np_array = doc.to_array([LOWER, POS, ENT_TYPE, TAG])
        np_array = numpy.delete(np_array, indexes, axis = 0)
        doc2 = Doc(doc.vocab, words=[t.text for i, t in enumerate(doc) if i not in indexes])
        doc2.from_array([LOWER, POS, ENT_TYPE, TAG], np_array)
        return doc2
    
    def _create_tagger(self):
        Token.set_extension("pos_tag", default=None, force=True)
        keywords = ("for", "loop", "while", "number", "nested", "if", "else", "ladder", "try")
        pos_tag = "CODE"
        config = {"keywords": keywords, "pos_tag": pos_tag}
        self._nlp.add_pipe("keyword_pos_tagger", config=config)

    def _create_doc(self, input: str):
        return self.remove_tokens_on_match(self._nlp(self.clean_input(input)))

    def get_similar_commands(self, inputStr: str, match_threshold = 0.7):
        input = self._create_doc(inputStr)
        top_choices: list[Command] = []
        for i, command in enumerate(self.parsed_commands):
            similarity = command.similarity(input)
            top_choices.append({"command": self.commands[i]['command'], "title": self.commands[i]['title'], "similarity": similarity})
        top_choices.sort(key= lambda e: e["similarity"], reverse=True)
        return top_choices if len(top_choices) < 5 else top_choices[:5]
