import React from 'react';

const Sidebar = () => {
  return (
    <aside style={{ width: '300px', padding: '20px', borderLeft: '1px solid #ddd' }}>
      <h3>Popular Tags</h3>
      <ul>
        <li>#Rant</li>
        <li>#Corruption</li>
        <li>#PublicInformation</li>
        <li>#LocalGovernment</li>
      </ul>

      <h3>Detailed Guide for Government Offices</h3>
      <ul>
        <li>Applying for Driver's License</li>
        <li>Starting a New Business</li>
        <li>Getting a Passport</li>
      </ul>

      <h3>Public Events</h3>
      <ul>
        <li>Fulpati Celebration</li>
        <li>Bagmati Sarasfai</li>
        <li>Kora - Cycling Rally</li>
      </ul>
    </aside>
  );
};

export default Sidebar;
