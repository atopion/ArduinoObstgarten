#!/usr/bin/env python

import pandas as pd
import json
from matplotlib import pyplot as plt
import numpy as np
import sys

def create_forecast():

    return df

def create_heatmap(json_file):
    """
    create dataframe from json data file and fill non-existing values with nan, create heatmap with seaborn from given dataframe and save it as png file
    :param json_file: json file containing a string with x,y coordinates of the nodes and values for the sensor
    :return: -
    """

    with open(json_file) as f:
        json_data = json.load(f)
        usr = json_data["user"]
        time = json_data["time"]
        del json_data["time"]
        del json_data["user"]

    # print(json_data['data'])

    x_points = []
    y_points = []
    for element in json_data['data']:
        x_points.append(element["x"])
        y_points.append(element["y"])

    # create and fill dataframe from json
    df = pd.DataFrame()
    for x in range(0, max(set(x_points))+1, 1):
        for y in range(0, max(set(y_points))+1, 1):
            b = False
            for element in json_data['data']:
                if element["x"] == x and element["y"] == y:
                    df.loc[y, x] = element["val"]
                    b = True
            if not b:
                df.loc[y, x] = None

    compact_df = rearrange_data(df)
    compact_df = interpol_data(compact_df)
    # create figure and save to png file
    fig, ax = plt.subplots(figsize=(5, 5))
    im = ax.imshow(compact_df.to_numpy(), cmap='YlGn')
    ax.set_title(usr + ' ' + time)
    cbar = fig.colorbar(im, ax=ax)
    # plt.show()
    fig.savefig(json_file + '.png')
    return df


def rearrange_data(df):
    """
    rearranges given dataframe by adding nan rows until columns and indexes are same
    :param df: dataframe with values and nans of any dimension
    :return: returns same dataframe with square dimensions containing two surrounding rows with nans and zeros
    """

    if df.shape[0] < df.shape[1]:
        for i in range(df.shape[1]-df.shape[0]):
            df = df.append(pd.Series(), ignore_index=True)
    elif df.shape[0] > df.shape[1]:
        for i in range(df.shape[0]-df.shape[1]):
            df[df.columns[len(df.columns)-1]+1] = np.nan

    # fill surroundings with nans
    df.loc[:, len(df.columns)] = np.nan
    df.loc[:, len(df.columns)] = np.nan
    df = move_col_front(df)
    df.loc[len(df)] = np.nan
    df.loc[len(df)] = np.nan
    df = move_row_front(df)
    # fill surroundings with zeros
    df.loc[:, len(df.columns)] = 0
    df.loc[:, len(df.columns)] = 0
    df = move_col_front(df)
    df.loc[len(df)] = 0
    df.loc[len(df)] = 0
    df = move_row_front(df)
    print(df)
    return df


def move_row_front(df):
    """
    Moves last row to the top of the given dataframe
    :param df: dataframe with arbitrary content
    :return: same dataframe, but with last row at the top
    """
    df = pd.concat([df.iloc[[df.shape[0]-1], :], df.drop(df.shape[0]-1, axis=0)], axis=0)
    df = df.reset_index(drop=True)
    return df


def move_col_front(df):
    """
    Moves last column to the front of the given dataframe
    :param df: dataframe with arbitrary content
    :return: same dataframe, but with last column at the front
    """
    cols = list(df)
    cols2 = list(df)
    cols.insert(0, cols.pop(cols.index(len(df.columns)-1)))
    df = df.loc[:, cols]
    df.columns = cols2
    return df


def interpol_data(df):
    """
    interpolate data in given dataframe
    :param df: dataframe containing floats or nans
    :return: datafrane with interpolated values and no nans
    """
    df = df.interpolate(axis=1, limit_direction='both', kind='linear')
    df.replace(0, np.nan, inplace=True)
    df.loc[df.shape[0]-1] = 0
    df.loc[0] = 0
    df = df.interpolate(axis=0, limit_direction='both', kind='linear')
    # drop nan and zero rows needed for interpolation
    df = df.drop(columns=[0, 1, len(df.columns) - 2, len(df.columns) - 1])
    df = df.drop([0, 1, df.shape[0] - 2, df.shape[0] - 1])
    return df


if __name__ == '__main__':
    if len(sys.argv) == 2:
        print(sys.argv[0])
        filename = sys.argv[1]
        create_heatmap(filename)
    # elif len(sys.argv) == 3:
    #     filename = sys.argv[1]
    #     print("creating forecast")
    #     if sys.argv[2] == "forecast":
    #         create_forecast(filename)
    else:
        print("too few arguments, using dummy")
        create_heatmap("user4_dat.json")
