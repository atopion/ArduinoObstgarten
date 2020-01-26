#!/usr/bin/env python

import pandas as pd
import seaborn as sns
import json
from matplotlib import pyplot as plt
from scipy import interpolate
from scipy.interpolate import griddata
import numpy as np
import sys


def create_heatmap(json_file):
    with open(json_file) as f:
        json_data = json.load(f)
        del json_data["time"]
        del json_data["header"]

    df = pd.DataFrame()
    print(json_data['data'])

    points = []
    x_points = []
    y_points = []
    for element in json_data['data']:
        points.append(tuple((element["x"], element["y"])))
        x_points.append(element["x"])
        y_points.append(element["y"])
    print(x_points, y_points)

    for x in range(0, max(set(x_points))+1, 1):
        for y in range(0, max(set(y_points))+1, 1):
            b = False
            for element in json_data['data']:
                print(element["x"], "x:", x, element["y"], "y:", y)
                if element["x"] == x and element["y"] == y:
                    print(element["x"], element["y"])
                    df.set_value(y, x, element["val"])
                    b = True
            if not b:
                df.set_value(y, x, None)

    compact_df = rearrange_data(df)
    compact_df = interpol_data(compact_df)
    print(compact_df.to_string())
    plt.imshow(compact_df.to_numpy(), cmap='YlGn')
    plt.colorbar()
    plt.show()
    plt.savefig(json_file + '.png')


def rearrange_data(df):
    """
    rearranges given dataframe by removing nan rows and columns and adding one
    :param df: dataframe to delete nans from
    :return: returns same dataframe with square dimensions made by nan rows and surrounding rows with zeros
    """

    if df.shape[0] < df.shape[1]:
        for i in range(df.shape[1]-df.shape[0]):
            df = df.append(pd.Series(), ignore_index=True)
    elif df.shape[0] > df.shape[1]:
        for i in range(df.shape[0]-df.shape[1]):
            df[df.columns[len(df.columns)-1]+1] = np.nan
    df.loc[:, len(df.columns)] = 0
    df.loc[len(df)] = 0
    print(df)
    return df


def interpol_data(df):
    """
    interpolate data in given dataframe
    :param df: dataframe containing floats or nans
    :return: datafrane with interpolated values and no nans
    """
    df = df.interpolate(axis=1, limit_direction='both', kind='linear')
    print(df.to_string())
    df.replace(0, np.nan, inplace=True)
    df.loc[df.shape[1]] = 0
    df = df.interpolate(axis=0, kind='linear')
    print(df.to_string())
    df = df.drop(columns=len(df.columns) - 1)
    df = df.drop([df.shape[0] - 2, df.shape[0] - 1])
    return df


if __name__ == '__main__':
    if len(sys.argv) > 1:
        filename = sys.argv[1]
        create_heatmap(filename)
    else:
        # create_heatmap("user1_dat.json")
        print("too few arguments")
