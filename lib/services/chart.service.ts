import { getDatabase } from '@/lib/db/mongodb';
import { Chart } from '@/types/chart';
import { ObjectId } from 'mongodb';

export class ChartService {
  static async create(chart: Omit<Chart, 'id' | 'createdAt' | 'updatedAt'>): Promise<Chart> {
    const db = await getDatabase();
    
    const doc = {
      dashboardId: chart.dashboardId,
      series: chart.series,
      yAxes: chart.yAxes,
      chartOptions: chart.chartOptions,
      xAxisOptions: chart.xAxisOptions,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: chart.createdBy,
    };

    const result = await db.collection('charts').insertOne(doc);
    
    return {
      id: result.insertedId.toString(),
      ...doc,
    } as Chart;
  }

  static async getById(id: string, userId?: string): Promise<Chart | null> {
    try {
      const db = await getDatabase();
      
      if (!ObjectId.isValid(id)) {
        return null;
      }
      
      const query: Record<string, unknown> = { _id: new ObjectId(id) };
      if (userId) {
        query.createdBy = userId;
      }
      
      const chart = await db.collection('charts').findOne(query);
      
      if (!chart) return null;

      return {
        id: chart._id.toString(),
        dashboardId: chart.dashboardId,
        series: chart.series,
        yAxes: chart.yAxes,
        chartOptions: chart.chartOptions,
        xAxisOptions: chart.xAxisOptions,
        createdAt: chart.createdAt,
        updatedAt: chart.updatedAt,
        createdBy: chart.createdBy,
      };
    } catch (error) {
      console.error('Error in ChartService.getById:', error);
      return null;
    }
  }

  static async getByDashboardId(dashboardId: string, userId?: string): Promise<Chart[]> {
    try {
      const db = await getDatabase();
      
      if (!ObjectId.isValid(dashboardId)) {
        return [];
      }
      
      const query: Record<string, unknown> = { dashboardId };
      if (userId) {
        query.createdBy = userId;
      }
      
      const charts = await db.collection('charts').find(query).toArray();
      
      return charts.map(chart => ({
        id: chart._id.toString(),
        dashboardId: chart.dashboardId,
        series: chart.series,
        yAxes: chart.yAxes,
        chartOptions: chart.chartOptions,
        xAxisOptions: chart.xAxisOptions,
        createdAt: chart.createdAt,
        updatedAt: chart.updatedAt,
        createdBy: chart.createdBy,
      }));
    } catch (error) {
      console.error('Error in ChartService.getByDashboardId:', error);
      return [];
    }
  }

  static async getAll(userId?: string): Promise<Chart[]> {
    try {
      const db = await getDatabase();
      
      const query: Record<string, unknown> = {};
      if (userId) {
        query.createdBy = userId;
      }
      
      const charts = await db.collection('charts').find(query).toArray();
      
      return charts.map(chart => ({
        id: chart._id.toString(),
        dashboardId: chart.dashboardId,
        series: chart.series,
        yAxes: chart.yAxes,
        chartOptions: chart.chartOptions,
        xAxisOptions: chart.xAxisOptions,
        createdAt: chart.createdAt,
        updatedAt: chart.updatedAt,
        createdBy: chart.createdBy,
      }));
    } catch (error) {
      console.error('Error in ChartService.getAll:', error);
      return [];
    }
  }

  static async getDashboardIdsByDataSetId(dataSetId: string): Promise<string[]> {
    try {
      const db = await getDatabase();
      const charts = await db
        .collection('charts')
        .find({ 'series.dataSetId': dataSetId })
        .project({ dashboardId: 1 })
        .toArray();

      return Array.from(new Set(charts.map((c) => String(c.dashboardId || '')))).filter(Boolean);
    } catch (error) {
      console.error('Error in ChartService.getDashboardIdsByDataSetId:', error);
      return [];
    }
  }

  static async getDataSetIdsByDashboardIds(dashboardIds: string[]): Promise<string[]> {
    try {
      if (dashboardIds.length === 0) return [];
      const db = await getDatabase();
      const charts = await db
        .collection('charts')
        .find({ dashboardId: { $in: dashboardIds } })
        .project({ series: 1 })
        .toArray();

      const ids = new Set<string>();
      charts.forEach((chart) => {
        const series = Array.isArray(chart.series) ? chart.series : [];
        series.forEach((s) => {
          if (s?.dataSetId) ids.add(String(s.dataSetId));
        });
      });

      return Array.from(ids);
    } catch (error) {
      console.error('Error in ChartService.getDataSetIdsByDashboardIds:', error);
      return [];
    }
  }

  static async update(
    id: string,
    updates: Partial<Omit<Chart, 'id' | 'createdAt' | 'createdBy'>>,
    userId: string
  ): Promise<Chart | null> {
    const db = await getDatabase();
    
    const updateDoc: Record<string, unknown> = {
      ...updates,
      updatedAt: new Date(),
    };

    const result = await db.collection('charts').findOneAndUpdate(
      { _id: new ObjectId(id), createdBy: userId },
      { $set: updateDoc },
      { returnDocument: 'after' }
    );

    if (!result) return null;

    return {
      id: result._id.toString(),
      dashboardId: result.dashboardId,
      series: result.series,
      yAxes: result.yAxes,
      chartOptions: result.chartOptions,
      xAxisOptions: result.xAxisOptions,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      createdBy: result.createdBy,
    } as Chart;
  }

  static async updateById(
    id: string,
    updates: Partial<Omit<Chart, 'id' | 'createdAt' | 'createdBy'>>
  ): Promise<Chart | null> {
    const db = await getDatabase();
    
    const updateDoc: Record<string, unknown> = {
      ...updates,
      updatedAt: new Date(),
    };

    const result = await db.collection('charts').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateDoc },
      { returnDocument: 'after' }
    );

    if (!result) return null;

    return {
      id: result._id.toString(),
      dashboardId: result.dashboardId,
      series: result.series,
      yAxes: result.yAxes,
      chartOptions: result.chartOptions,
      xAxisOptions: result.xAxisOptions,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      createdBy: result.createdBy,
    } as Chart;
  }

  static async delete(id: string, userId: string): Promise<boolean> {
    const db = await getDatabase();
    const result = await db.collection('charts').deleteOne({
      _id: new ObjectId(id),
      createdBy: userId,
    });
    
    return result.deletedCount > 0;
  }
}

