import { NextRequest, NextResponse } from 'next/server';
import { DataSourceService } from '@/lib/services/data-source.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tableId: string }> }
) {
  try {
    const { tableId } = await params;
    // tableId is now the data source id
    const dataSource = await DataSourceService.getById(tableId);
    
    if (!dataSource) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    return NextResponse.json(dataSource);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
