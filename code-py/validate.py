"""
Validate user models
Needs skills_stats.csv
"""
from collections import defaultdict
import pandas as pd
import numpy as np
from import_data import import_data, make_df
from pix_math import proba, get_estimated_level, get_mle, get_metrics


data = import_data()
df = make_df(data)
print(df.shape)


with open('test.txt') as f:
    test_user_ids = f.read().splitlines()

# Get pandas
# Subset source = direct

test = df.query('userId in @test_user_ids and source == "direct"')
print(test.shape)
test = df.query('userId in @test_user_ids and source == "direct" '
                'and status != "reset"')
print(test.shape)
print(test.head())
print(test.columns)

# Load estimated difficulties
stats = pd.read_csv('skills_stats.csv')
test_viz = test.merge(stats, on='skillId').sort_values(['userId', 'createdAt'])
print(test_viz.shape)
print(test_viz.head())

for user_id in test_user_ids[4:]:
    subset = test_viz.query('userId == @user_id')
    print(subset.columns)
    history = []
    history2 = []
    current_level = current_level2 = 2
    current_mle = current_mle2 = 2
    all_pred = defaultdict(list)
    all_outcomes = []
    for _, diff, outcome, pred_diff in (
            np.array(subset[['tube', 'level', 'outcome', 'predDifficulty']])):
        p = proba(current_level, diff)
        p_mle = proba(current_mle, diff)
        p2 = proba(current_level2, pred_diff)
        p2_mle = proba(current_mle2, pred_diff)
        all_pred['est'].append(p)
        all_pred['est2'].append(p2)
        all_pred['mle'].append(p_mle)
        all_pred['mle2'].append(p2_mle)
        # print(current_level, 'for', diff, 'we predict', p)
        # print(diff, outcome, pred_diff)
        history.append((diff, outcome))
        history2.append((pred_diff, outcome))
        all_outcomes.append(outcome)
        current_level = get_estimated_level(history)
        current_mle = get_mle(history)
        current_level2 = get_estimated_level(history2)
        current_mle2 = get_mle(history2)
    get_metrics(all_outcomes, all_pred)
    # break
