"""
Functions for importing the JSON data files
"""
import glob
import json
import os
from collections import Counter
import pandas as pd
import numpy as np
import logging


def import_data():
    """
    Load JSON
    """
    data = {}
    for filename in glob.glob('data-files/*.json'):
        key = os.path.basename(filename).replace('.json', '')
        with open(filename) as f:
            data[key] = json.load(f)
            logging.info('Loaded %s with %s', key, list(data[key][0].keys()))
    return data


def make_df(data):
    """
    Unfold usersData so that we can make a DataFrame from it
    """
    usersData = []
    for line in data['usersData']:
        userId = line['userId']
        for entry in line['knowledgeElements']:
            usersData.append({'userId': userId, **entry})
    df = pd.DataFrame.from_dict(usersData)
    df['outcome'] = df['status'].map({'validated': 1, 'invalidated': 0})
    return df


def make_df_skills(data):
    """
    Make a pandas DataFrame with all skills
    """
    skills = pd.DataFrame.from_dict(data['skills'])
    skills['tube'] = skills['name'].map(lambda x: x[1:-1])
    skills['level'] = skills['name'].map(lambda x: x[-1:]).astype(np.int32)
    skills = skills.sort_values(['tube', 'level'])
    max_level = dict(skills.groupby('tube')['level'].max())
    skills['maxLevel'] = skills['tube'].map(max_level)
    tube_length = dict(skills.groupby('tube')['level'].count())
    # Count if validated, if invalidated
    nb_val = Counter()
    nb_inval = Counter()
    nb_seen = Counter()
    for name, tube in zip(skills['name'], skills['tube']):
        nb_inval[name] = tube_length[tube] - nb_seen[tube]
        nb_seen[tube] += 1
        nb_val[name] = nb_seen[tube]
    skills['nb_inval'] = skills['name'].map(nb_inval)
    skills['nb_val'] = skills['name'].map(nb_val)
    return skills
