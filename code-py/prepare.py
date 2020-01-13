"""
Prepare train and test user IDs
Creates train.txt and test.txt
"""
from random import shuffle
from import_data import import_data, make_df

data = import_data()
df = make_df(data)

users = df['userId'].unique()
shuffle(users)
n = len(users)
TRAIN_LEN = round(0.8 * n)
train = users[:TRAIN_LEN]
TEST_LEN = 10
test = users[TRAIN_LEN:TRAIN_LEN + TEST_LEN]

with open('train.txt', 'w') as f:
    f.write('\n'.join(train))

with open('test.txt', 'w') as f:
    f.write('\n'.join(test))
