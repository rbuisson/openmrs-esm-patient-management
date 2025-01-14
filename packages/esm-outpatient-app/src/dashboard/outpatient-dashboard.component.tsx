import { attach, detach, ExtensionSlot, useExtensionStore, useLayoutType, isDesktop } from '@openmrs/esm-framework';
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PatientQueueHeader from '../patient-queue-header/patient-queue-header.component';
import { useNavGroups } from '../side-menu/nav-group/nav-group';
import styles from './outpatient-dashboard.scss';

export interface DashboardConfig {
  name: string;
  slot: string;
  title: string;
}

export const OutpatientDashboard = () => {
  const { view } = useParams();
  const layout = useLayoutType();

  const extensionStore = useExtensionStore();
  const { navGroups } = useNavGroups();

  const ungroupedDashboards =
    extensionStore.slots['outpatient-dashboard-slot']?.assignedExtensions
      .map((e) => e.meta)
      .filter((e) => Object.keys(e).length) || [];
  const groupedDashboards = navGroups
    .map((slotName) => extensionStore.slots[slotName]?.assignedExtensions.map((e) => e.meta))
    .flat();
  const dashboards = ungroupedDashboards.concat(groupedDashboards) as Array<DashboardConfig>;
  const currentDashboard = dashboards.find((dashboard) => dashboard.name === view) || dashboards[0];

  useEffect(() => {
    if (!isDesktop(layout)) {
      attach('global-nav-menu-slot', 'outpatient-side-nav-ext');
    }
    return () => detach('global-nav-menu-slot', 'outpatient-side-nav-ext');
  }, [layout]);

  return (
    <div className={styles.dashboardContainer}>
      {isDesktop(layout) && <ExtensionSlot extensionSlotName="outpatient-sidebar-slot" key={layout} />}
      {currentDashboard && (
        <div className={`cds--grid ${styles.dashboardContent}`}>
          <PatientQueueHeader title={currentDashboard.title} />
          <DashboardView
            dashboardSlot={currentDashboard.slot}
            title={currentDashboard.title}
            key={currentDashboard.slot}
          />
        </div>
      )}
    </div>
  );
};

const DashboardView: React.FC<{ dashboardSlot: string; title: string }> = ({ dashboardSlot, title }) => {
  return <ExtensionSlot extensionSlotName={dashboardSlot} state={{ dashboardTitle: title }} />;
};
