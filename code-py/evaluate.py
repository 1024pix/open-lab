"""
Evaluate difficulties of acquix
The first part generates the data.csv file for machine learning
(github.com/jilljenn/ktm then generates coef0.npy, the predicted difficulties)
The second part generates skills_stats.csv for further use
"""
from collections import Counter
import pandas as pd
import numpy as np
from import_data import import_data, make_df, make_df_skills


data = import_data()
df = make_df(data)


with open('train.txt') as f:
    train_user_ids = f.read().splitlines()

# Get pandas
# Subset source = direct

train = df.query('userId in @train_user_ids and source == "direct"')
print(train.shape)
train = df.query('userId in @train_user_ids and source == "direct" '
                 'and status != "reset"')
print(train.shape)
print(train.head())
print(train.columns)

# Create dataset in order to compute difficulties

train['correct'] = train['outcome'].astype(np.int32)
encode_user = dict(zip(train['userId'].unique(), range(10000)))
train['user'] = train['userId'].map(encode_user)  # To put 0..N
encode_item = dict(zip(train['skillId'].unique(), range(10000)))
train['item'] = train['skillId'].map(encode_item)
train['skill'] = train['item']
train['wins'] = train['fails'] = 0

dataset = train[['user', 'item', 'skill', 'correct',
                 'wins', 'fails', 'skillId']]
print(len(dataset['user'].unique()), 'users')
print(len(dataset['item'].unique()), 'items')
# dataset.to_csv('/home/jj/code/ktm/data/openlab/data.csv', index=None)

# Load results of ktm and save coefficients into skills_stats.csv
coef = np.load('/home/jj/code/ktm/data/openlab/coef0.npy').reshape(-1)[-44:]
print(coef.shape)

csv_dataset = (pd.read_csv('/home/jj/code/ktm/data/openlab/data.csv')
               .groupby(['item', 'skillId'])['correct'].mean().reset_index())
csv_dataset['predDifficulty'] = -coef + 3
print(csv_dataset)

skills = make_df_skills(data)
skills_viz = csv_dataset.merge(skills, left_on='skillId', right_on='id')
skills_viz['delta'] = (skills_viz['level'] -
                       skills_viz['predDifficulty'])  # Estimation error
skills_viz = skills_viz.sort_values('predDifficulty')
print(skills_viz.columns)
stats = skills_viz[['tube', 'level', 'predDifficulty',
                    'pixValue', 'delta', 'skillId']]
stats.to_csv('skills_stats.csv', index=None)
