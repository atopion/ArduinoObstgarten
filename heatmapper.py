#!/usr/bin/env python

import pandas as pd
import json
from matplotlib import pyplot as plt
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
                # print(element["x"], "x:", x, element["y"], "y:", y)
                if element["x"] == x and element["y"] == y:
                    # print(element["x"], element["y"])
                    df.set_value(y, x, element["val"])
                    b = True
            if not b:
                df.set_value(y, x, None)
    values = df.to_numpy()
    # print(df)
    z = []
    for i in range(0, len(values), 1):
        # print(values[i][~np.isnan(values[i])])
        z.append(values[i][~np.isnan(values[i])])

    compact_df = rearrange_data(df)
    compact_df = interpol_data(compact_df)
    # print(compact_df.to_string())
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
    df = pd.concat([df.iloc[[df.shape[0]-1], :], df.drop(df.shape[0]-1, axis=0)], axis=0)
    df = df.reset_index(drop=True)
    return df


def move_col_front(df):
    cols = list(df)
    cols2 = list(df)
    cols.insert(0, cols.pop(cols.index(len(df.columns)-1)))
    df = df.ix[:, cols]
    df.columns = cols2
    return df


def interpol_data(df):
    """
    interpolate data in given dataframe
    :param df: dataframe containing floats or nans
    :return: datafrane with interpolated values and no nans
    """
    df = df.interpolate(axis=1, limit_direction='both', kind='linear')
    # print(df.to_string())
    df.replace(0, np.nan, inplace=True)
    # print(df.to_string())
    df.loc[df.shape[0]-1] = 0
    df.loc[0] = 0
    # print(df.to_string())
    df = df.interpolate(axis=0, limit_direction='both', kind='linear')
    df = df.drop(columns=[0, len(df.columns) - 1])
    df = df.drop([0, df.shape[0] - 1])
    # print(df.to_string())
    # print(df.shape)
    return df
    # grid = griddata(df.to_numpy(), values, (grid_x, grid_y), method='linear')
    # df.interpolate(method="akima", limit_direction="both", inplace=True)
    # print(grid)


if __name__ == '__main__':
    if len(sys.argv) > 1:
        filename = sys.argv[1]
        create_heatmap(filename)
    else:
        create_heatmap("user2_dat.json")
        print("too few arguments")
