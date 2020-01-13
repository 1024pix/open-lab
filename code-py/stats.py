"""
Compute a few statistics from the dataset
"""
from collections import Counter
import matplotlib.pyplot as plt
import numpy as np
from import_data import import_data, make_df, make_df_skills


data = import_data()
for line in data['usersData'][42]['knowledgeElements'][:5]:
    print(line)

df = make_df(data)
print(Counter(df['status']))
success_rate = df.groupby('userId')['outcome'].mean()

# Visualize the histogram of success rates
plt.hist(np.array(success_rate))
plt.show()
print(df.columns)

USER_ID = df['userId'].unique()[42]
subset = df.query('userId == @USER_ID')
subset['orderId'] = subset.index
print('Subset')
print(subset[['skillId', 'source', 'outcome']])
print(subset.outcome.mean())

skills = make_df_skills(data)
print(skills.columns)
print('vs', subset.columns)
print(skills.head())

interesting = (subset.merge(skills, left_on='skillId',
                            right_on='id')[['tube', 'level', 'source',
                                            'outcome', 'orderId', 'createdAt']]
               .sort_values('createdAt'))
for line in np.array(interesting):
    print(line[:-2])
