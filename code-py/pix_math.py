"""
Utility functions for doing item response theory in Pix.
Bayesian inference, maximum likelihood estimates, etc.
"""
from math import log
import numpy as np
from scipy.optimize import brentq


def proba(level, diff):
    '''
    The Rasch model, probability for a learner to solve correctly a question.
    level: learner ability
    diff: question difficulty (usually acquix difficulty)
    '''
    return 1/(1 + np.exp(-(level - diff)))


def get_dll(theta, history):
    '''
    Computing the derivative of the log-likelihood at theta, given the history
    of observations.
    To maximize the likelihood, we have to find the zeroes of this function.
    '''
    return sum(outcome - proba(theta, diff) for diff, outcome in history)


def get_estimated_level(history):
    '''
    Computes the approximate MLE (maximum likelihood estimate)
    according to Pix code, by steps of 0.5
    mle = maximum likelihood estimate
    dll = derivative log likelihood
    '''
    modified_history = history[:] + [(0, 1), (7, 0)]
    mle = None
    min_abs_dll = float('inf')
    for theta in np.arange(0.5, 8, 0.5):
        dll = abs(get_dll(theta, modified_history))
        if dll < min_abs_dll:
            min_abs_dll = dll
            mle = theta
    return mle


def get_mle(history):
    '''
    Get a more precise MLE using root-finding algorithms
    Future work: implement Brent or Newton in JavaScript for Pix
    '''
    modified_history = history[:] + [(0, 1), (7, 0)]
    return brentq(lambda theta: get_dll(theta, modified_history), 0, 7)


def log_loss(real, pred):
    '''
    Compute the log loss, given the real outcomes, and the predicted ones.
    '''
    return -sum(a * log(p) + (1 - a) * log(1 - p) for a, p in zip(real, pred))


def get_metrics(real, pred, last=10):
    '''
    Displays all metrics (accuracy, log loss) for different methods.
    '''
    for key in pred:
        print(key, 'acc', np.mean(np.round(pred[key][-last:]) == real[-last:]))
        print(key, 'll', log_loss(real[-last:], pred[key][-last:]))
