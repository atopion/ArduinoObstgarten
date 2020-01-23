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
    data_points = np.array(points)
    for x in range(0, 10, 1):
        for y in range(0, 10, 1):
            b = False
            for element in json_data['data']:
                if element["x"] == x and element["y"] == y:
                    df.set_value(y, x, element["val"])
                    b = True
            if not b:
                df.set_value(y, x, None)
    values = df.to_numpy()
    z = []
    for i in range(0, len(values), 1):
        print(values[i][~np.isnan(values[i])])
        z.append(values[i][~np.isnan(values[i])])

    compact_df = rearrange_data(df)
    compact_df = compact_df.interpolate()
    print(compact_df)
    compact_df.fillna(0)
    plt.imshow(compact_df.to_numpy(), cmap='YlGn')
    plt.colorbar()
    plt.show()
    plt.savefig('output.png')

    # interpol_data(compact_df, x_points, y_points, z, data_points)

    # print(f)
    # print(df.to_numpy().shape)
    # plt.imshow(f, cmap='YlGn')
    # plt.colorbar()
    # plt.show()
    # # sns.pairplot(df)
    # plt.savefig('output.png')


def rearrange_data(df):
    """
    rearranges given dataframe by removing nan rows and columns and adding one
    :param df: dataframe to delete nans from
    :return: returns same dataframe without nan rows and columns apart from nans surrounding datapoints
    """
    df = df.dropna(axis=1, how="all")
    df = df.dropna(axis=0, how="all")
    # df[df.columns[len(df.columns)-1]+1] = np.nan
    # df = df.append(pd.Series(), ignore_index=True)
    if df.shape[0] < df.shape[1]:
        for i in range(df.shape[1]-df.shape[0]):
            df = df.append(pd.Series(), ignore_index=True)
    elif df.shape[0] > df.shape[1]:
        for i in range(df.shape[0]-df.shape[1]):
            df[df.columns[len(df.columns)-1]+1] = np.nan
    print(df)
    return df


def interpol_data(df, x_axis, y_axis, z, points):
    """
    interpolate data in given dataframe
    :param df: dataframe containing floats or nans
    :return: datafrane with interpolated values and no nans
    """
    xx, yy = np.meshgrid(x_axis, y_axis)
    print(xx)
    print(yy)
    z = df.to_numpy()
    print(z)
    print(y_axis)
    print(len(y_axis), len(z))
    data = interpolate.interp1d(y_axis, z, kind='linear')
    # data = interpolate.interp1d(x_axis, y_axis, z, kind='linear')
    df_interpol = pd.DataFrame(data=data)
    print(df_interpol)
    return df_interpol
    # grid = griddata(df.to_numpy(), values, (grid_x, grid_y), method='linear')
    # df.interpolate(method="akima", limit_direction="both", inplace=True)
    # print(grid)


if __name__ == '__main__':
    if len(sys.argv) > 1:
        filename = sys.argv[1]
        create_heatmap(filename)
    else:
        print("too few arguments")
