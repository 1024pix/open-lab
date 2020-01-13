"""
Reproduce Pix's placement test
"""
from import_data import import_data, make_df_skills
from pix_math import proba, get_estimated_level


data = import_data()

# Convert to our model

# All:
# Ce serait bien d'avoir des ID à seulement 2 caractères hexa
# ça diminuerait la taille du dataset

# Challenge:
# - Je suis pas sûr que is_timed soit présent dans le dataset
# - competenceId est redondant car on peut le récupérer depuis skills

skills = make_df_skills(data)


# pylint: disable = redefined-outer-name, unused-argument
def pix_filter(skills, level):
    """
    Filter skills, keep within estimated level + 2
    """
    return skills.query('level <= @level + 2')


pix_filter(skills, 2)
pix_filter(skills, 3)

print(len(data['challenges']), 'challenges')


def pix_sort(skills, level):
    """
    Sort according to reward function
    """
    skills['proba'] = proba(level, skills['level'])
    skills['score'] = (skills['proba'] * skills['nb_val'] +
                       (1 - skills['proba']) * skills['nb_inval'])
    print(skills[['name', 'maxLevel', 'proba',
                  'nb_val', 'nb_inval', 'score']]
          .sort_values('score', ascending=False).head(10))


# Test for someone in particular
history = [(2, 0), (2, 1), (3, 0), (3, 0), (3, 1)]


current_level = 2
for t in range(1, 6):
    print(t)
    print('current', current_level)
    pix_sort(pix_filter(skills, current_level), current_level)
    current_level = get_estimated_level(history[:t])
