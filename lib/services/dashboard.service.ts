import { getDatabase } from '@/lib/db/mongodb';
import { Dashboard, DashboardShare, DashboardLayout } from '@/types/dashboard';
import { DEFAULT_CHARTS_PER_ROW, normalizeDashboardLayout } from '@/lib/dashboard-layout';
import { ObjectId } from 'mongodb';

const DEFAULT_LAYOUT: DashboardLayout = { chartsPerRow: DEFAULT_CHARTS_PER_ROW };
const DEFAULT_SHOW_DATE_RANGE_PICKER = true;

function resolveIsPublic(doc: Record<string, unknown>): boolean {
  if (typeof doc.isPublic === 'boolean') return doc.isPublic;
  return doc.access === 'public';
}

export class DashboardService {
  static async create(dashboard: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dashboard> {
    const db = await getDatabase();
    const isPublic = dashboard.isPublic ?? false;
    const doc = {
      title: dashboard.title,
      description: dashboard.description || null,
      charts: dashboard.charts,
      chartIds: dashboard.chartIds || [],
      groupIds: dashboard.groupIds || [],
      isPublic,
      defaultDateRange: dashboard.defaultDateRange || null,
      showDateRangePicker: dashboard.showDateRangePicker ?? DEFAULT_SHOW_DATE_RANGE_PICKER,
      layout: normalizeDashboardLayout(
        dashboard.layout,
        dashboard.chartIds?.length ?? dashboard.charts?.length ?? 0
      ),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: dashboard.createdBy,
    };

    const result = await db.collection('dashboards').insertOne(doc);
    
    return {
      id: result.insertedId.toString(),
      ...doc,
    } as Dashboard;
  }

  static async getAll(userId?: string): Promise<Dashboard[]> {
    const db = await getDatabase();

    let query: Record<string, unknown>;

    if (!userId) {
      query = { $or: [{ isPublic: true }, { access: 'public' }] };
    } else {
      query = {
        $or: [
          { isPublic: true },
          { access: 'public' },
          { createdBy: userId },
        ],
      };
    }

    let editableGroupIds: string[] = [];
    let shareAccessMap = new Map<string, 'view' | 'edit'>();

    if (userId) {
      const userGroupIds = await this.getUserGroupIds(userId);
      if (userGroupIds.length > 0) {
        (query.$or as Array<Record<string, unknown>>).push({
          groupIds: { $in: userGroupIds },
        });
      }

      editableGroupIds = await this.getUserEditableGroupIds(userId);

      const shares = await db.collection('dashboard_shares').find({ userId }).toArray();
      shares.forEach((share) => {
        shareAccessMap.set(String(share.dashboardId), share.accessLevel);
      });
      const sharedDashboardIds = shares.map((share) => String(share.dashboardId));
      if (sharedDashboardIds.length > 0) {
        (query.$or as Array<Record<string, unknown>>).push({ _id: { $in: sharedDashboardIds.map(id => new ObjectId(id)) } });
      }
    }

    const dashboards = await db.collection('dashboards').find(query).toArray();
    
    return dashboards.map(dash => ({
      id: dash._id.toString(),
      title: dash.title,
      description: dash.description,
      charts: dash.charts,
      chartIds: dash.chartIds || [],
      groupIds: dash.groupIds || [],
      isPublic: resolveIsPublic(dash),
      defaultDateRange: dash.defaultDateRange,
      canEdit: userId
        ? dash.createdBy === userId ||
          shareAccessMap.get(dash._id.toString()) === 'edit' ||
          this.dashboardHasEditableGroupAccess(dash, editableGroupIds)
        : false,
      showDateRangePicker: dash.showDateRangePicker ?? DEFAULT_SHOW_DATE_RANGE_PICKER,
      layout: normalizeDashboardLayout(
        (dash.layout as Dashboard['layout'] | undefined) ?? undefined,
        (dash.chartIds as string[] | undefined)?.length ?? (dash.charts as Dashboard['charts'] | undefined)?.length ?? 0
      ),
      createdAt: dash.createdAt,
      updatedAt: dash.updatedAt,
      createdBy: dash.createdBy,
    }));
  }

  static async getById(id: string, userId?: string): Promise<Dashboard | null> {
    const db = await getDatabase();
    const dashboard = await db.collection('dashboards').findOne({ _id: new ObjectId(id) });
    
    if (!dashboard) return null;

    const isPublic = resolveIsPublic(dashboard);
    const createdBy = String(dashboard.createdBy || '');

    if (createdBy === userId) return this.mapDashboard(dashboard);
    if (isPublic) return this.mapDashboard(dashboard);

    if (!userId) return null;

    const share = await db.collection('dashboard_shares').findOne({
      dashboardId: id,
      userId,
    });
    if (share) return this.mapDashboard(dashboard);

    const groupIds = (dashboard.groupIds as string[] | undefined) || [];
    const hasGroupAccess = await this.userHasGroupAccess(userId, groupIds);
    if (hasGroupAccess) return this.mapDashboard(dashboard);

    return null;
  }

  static async update(id: string, updates: Partial<Omit<Dashboard, 'id' | 'createdAt' | 'createdBy'>>, userId: string): Promise<Dashboard | null> {
    const db = await getDatabase();
    
    const updateDoc: Record<string, unknown> = {
      ...updates,
      updatedAt: new Date(),
    };

    const result = await db.collection('dashboards').findOneAndUpdate(
      { _id: new ObjectId(id), createdBy: userId },
      { $set: updateDoc },
      { returnDocument: 'after' }
    );

    if (!result) return null;

    return this.mapDashboard(result);
  }

  static async delete(id: string, userId: string): Promise<boolean> {
    const db = await getDatabase();
    const result = await db.collection('dashboards').deleteOne({
      _id: new ObjectId(id),
      createdBy: userId,
    });

    // Also delete shares
    await db.collection('dashboard_shares').deleteMany({ dashboardId: id });
    
    return result.deletedCount > 0;
  }

  static async share(dashboardId: string, userId: string, accessLevel: 'view' | 'edit', createdBy: string): Promise<DashboardShare> {
    const db = await getDatabase();
    
    const doc = {
      dashboardId,
      userId,
      accessLevel,
      createdAt: new Date(),
      createdBy,
    };

    const result = await db.collection('dashboard_shares').insertOne(doc);
    
    return {
      id: result.insertedId.toString(),
      ...doc,
    } as DashboardShare;
  }

  static async getShares(dashboardId: string): Promise<DashboardShare[]> {
    const db = await getDatabase();
    const shares = await db.collection('dashboard_shares').find({ dashboardId }).toArray();
    
    return shares.map(share => ({
      id: share._id.toString(),
      dashboardId: share.dashboardId,
      userId: share.userId,
      accessLevel: share.accessLevel,
      createdAt: share.createdAt,
      createdBy: share.createdBy,
    }));
  }

  static async canEdit(dashboardId: string, userId?: string): Promise<boolean> {
    if (!userId) return false;
    const db = await getDatabase();
    const dashboard = await db.collection('dashboards').findOne({ _id: new ObjectId(dashboardId) });

    if (!dashboard) return false;
    if (dashboard.createdBy === userId) return true;

    const share = await db.collection('dashboard_shares').findOne({
      dashboardId,
      userId,
      accessLevel: 'edit',
    });
    if (share) return true;

    const editableGroupIds = await this.getUserEditableGroupIds(userId);
    return this.dashboardHasEditableGroupAccess(dashboard, editableGroupIds);
  }

  private static mapDashboard(doc: Record<string, unknown> & { _id: ObjectId }): Dashboard {
    return {
      id: doc._id.toString(),
      title: String(doc.title || ''),
      description: (doc.description as string | undefined) ?? undefined,
      charts: (doc.charts as Dashboard['charts']) || [],
      chartIds: (doc.chartIds as string[] | undefined) || [],
      groupIds: (doc.groupIds as string[] | undefined) || [],
      isPublic: resolveIsPublic(doc),
      defaultDateRange: (doc.defaultDateRange as string | undefined) ?? undefined,
      showDateRangePicker: (doc.showDateRangePicker as boolean | undefined) ?? DEFAULT_SHOW_DATE_RANGE_PICKER,
      layout: normalizeDashboardLayout(
        doc.layout as Dashboard['layout'] | undefined,
        (doc.chartIds as string[] | undefined)?.length ?? (doc.charts as Dashboard['charts'] | undefined)?.length ?? 0
      ),
      createdAt: (doc.createdAt as Date) || new Date(),
      updatedAt: (doc.updatedAt as Date) || new Date(),
      createdBy: String(doc.createdBy || ''),
    };
  }

  private static buildUserMatch(userId: string) {
    const ids: (string | ObjectId)[] = [userId];
    if (ObjectId.isValid(userId)) {
      ids.push(new ObjectId(userId));
    }
    return { $in: ids };
  }

  private static async getUserGroupIds(userId: string): Promise<string[]> {
    const db = await getDatabase();
    const userMatch = this.buildUserMatch(userId);
    const groups = await db.collection('groups').find({
      $or: [
        { owner: userMatch },
        { createdBy: userMatch },
        { memberIds: userMatch },
      ],
    }).project({ _id: 1 }).toArray();

    return groups.map((group) => group._id.toString());
  }

  private static async userHasGroupAccess(userId: string, groupIds: string[]): Promise<boolean> {
    if (groupIds.length === 0) return false;
    const db = await getDatabase();
    const userMatch = this.buildUserMatch(userId);
    const groupObjectIds = groupIds.filter(ObjectId.isValid).map((id) => new ObjectId(id));
    if (groupObjectIds.length === 0) return false;

    const group = await db.collection('groups').findOne({
      _id: { $in: groupObjectIds },
      $or: [
        { owner: userMatch },
        { createdBy: userMatch },
        { memberIds: userMatch },
      ],
    });

    return Boolean(group);
  }

  private static async getUserEditableGroupIds(userId: string): Promise<string[]> {
    const db = await getDatabase();
    const userMatch = this.buildUserMatch(userId);
    const groups = await db.collection('groups').find({
      role: 'edit',
      $or: [
        { owner: userMatch },
        { createdBy: userMatch },
        { memberIds: userMatch },
      ],
    }).project({ _id: 1 }).toArray();

    return groups.map((group) => group._id.toString());
  }

  private static dashboardHasEditableGroupAccess(
    dashboard: Record<string, unknown>,
    editableGroupIds: string[],
  ) {
    if (editableGroupIds.length === 0) return false;
    const dashboardGroupIds = (dashboard.groupIds as string[] | undefined) || [];
    if (dashboardGroupIds.length === 0) return false;
    return dashboardGroupIds.some((id) => editableGroupIds.includes(id));
  }
}

