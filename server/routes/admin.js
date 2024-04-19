const express = require('express');
const router = express.Router();
const adminLayout = '../views/layouts/admin';
const connection = require('../config/mysql');

//routes to Admin home page
router.get('/dashboard', async (req, res) => {
  try {
  const locals = {
      title: "Home",
      description: "NB-IoT Data Portal"
      }
  
      //let perPage = 6;
      //let page = req.query.page || 1;
  
      //const data = await Post.aggregate([ { $sort: { createdAt: -1 } } ])
      //.skip(perPage * page - perPage)
      //.limit(perPage)
      //.exec();
  
      //const count = await Post.countDocuments({});
      //const nextPage = parseInt(page) + 1;
      //const hasNextPage = nextPage <= Math.ceil(count / perPage);
  
      res.render('admin/dashboard', { 
      locals,
      layout: adminLayout,
      //data,
      //current: page,
      //nextPage: hasNextPage ? nextPage : null,
      currentRoute: '/'
      });
  } catch (error) {
    console.log(error);
  }
});

//routes when admin logout
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  //res.json({ message: 'Logout successful.'});
  res.redirect('/');
});

//routes for projects pages
router.get('/dashboard/projects', async (req, res) => {
  try {
    const locals = {
      title: 'Projects',
      description: 'NB-IoT Data Portal'
    }
    connection.query('SELECT * FROM Projects', (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        return;
      }
      res.render('admin/projects', {
        locals,
        layout: adminLayout,
        data: results
      });
    });
  } catch (error) {
    console.log(error);
  }
});

router.post('/added_project', (req, res) => {
  const project = {
    project_id: req.body.projectName,
    alerted_users: req.body.alertedUsers
  };
  // Insert the project data into the projects table
  connection.query('INSERT INTO Projects SET ?', project, function(error, results) {
    if (error) {
      console.error('Error inserting project data:', error);
    } else {
      console.log('Project inserted successfully.');
    }
    res.redirect('/dashboard/projects');
  });
});

router.get('/added_project', (req, res) => {
  res.redirect('/dashboard/projects');
});

router.get('/dashboard/projects/add_project', (req, res) => {
  try {
    const locals = {
        title: "Add Project",
        description: "NB-IoT Data Portal"
        }
    res.render('admin/add_project', { 
      locals,
      layout: adminLayout,
      });
    } catch (error) {
      console.log(error);
    }
  });

router.get('/dashboard/projects/:project_slug/edit', (req, res) => {
  try {
    const locals = {
        title: "Edit Project",
        description: "NB-IoT Data Portal"
        }
    const { project_slug } = req.params;

    connection.query('SELECT * FROM Projects WHERE project_id = ?', [project_slug], (err, results) => {
      if (err) {
        console.error('Error fetching project details:', err);
        // Handle the error
        return res.status(500).send('Internal Server Error');
      }
      if (results.length === 0) {
        // Project not found
        return res.status(404).send('Project not found');
      }
    const project = results[0];
    
    res.render('admin/edit_project', { 
      locals,
      layout: adminLayout,
      project_slug,
      project 
      });
    });
    } catch (error) {
      console.log(error);
    }
  });

router.post('/dashboard/projects/:project_slug/edited', (req, res) => {
  const projectId = req.params.project_slug;
  const projectName = req.body.projectName;
  const alertedUsers = req.body.alertedUsers;
  
  connection.query(
    'UPDATE Projects SET project_id = ?, alerted_users = ? WHERE project_id = ?',
    [projectName, alertedUsers, projectId],
    (err, result) => {
      if (err) {
        console.error('Error updating project:', err);
        
        return res.status(500).send('Internal Server Error');
      }
      
      res.redirect('/dashboard/projects/');
    });
});

router.get('/dashboard/projects/:project_slug/deleted', (req, res) => {
  const { project_slug } = req.params;

  connection.query('DELETE FROM Projects WHERE project_id = ?', [project_slug], (err, result) => {
    if (err) {
      console.error('Error deleting project:', err);
      // Handle the error
      return res.status(500).send('Internal Server Error');
    }
      res.redirect('/dashboard/projects/');
    });
});

//routes for sites pages
router.get('/dashboard/sites', async (req, res) => {
  try {
    const locals = {
      title: 'Sites',
      description: 'NB-IoT Data Portal'
    }
    connection.query('SELECT site_id, site_name, project_id, device_serial_number, device_type FROM Sites', (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        return;
      }
      res.render('admin/sites', {
        locals,
        layout: adminLayout,
        data: results
      });
    });
  } catch (error) {
    console.log(error);
  }
});

router.post('/added_site', (req, res) => {
  const siteName = req.body.siteId;
  const projectId = req.body.project;
  const latitude = req.body.latitude;
  const longitude = req.body.longitude;

  const deviceType = req.body.type;
  const deviceSerialNumber = req.body.serialNumber;

  const coverLevel = req.body.coverLevel;
  const invertLevel = req.body.invertLevel;
  const sensorInvertDistance = req.body.sensor_invert_distance;
  const firstWaterAlertLevel = req.body.firstWaterAlertLevel;
  const secondWaterAlertLevel = req.body.secondWaterAlertLevel;
  const firstWaterAlertActive = req.body.firstWaterAlertActive;
  const secondWaterAlertActive = req.body.secondWaterAlertActive;
  const groundLevel = req.body.groundLevel;

  const sql_site = `INSERT INTO Sites (site_name, project_id, position_latitude, position_longitude, device_type, 
    device_serial_number, cover_level, invert_level, sensor_invert_distance, first_water_alert_level, second_water_alert_level, 
    first_water_alert_active, second_water_alert_active, ground_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const sql_site_values = [siteName, projectId, latitude, longitude, deviceType, deviceSerialNumber, coverLevel, invertLevel, 
    sensorInvertDistance, firstWaterAlertLevel, secondWaterAlertLevel, firstWaterAlertActive, secondWaterAlertActive, groundLevel];

  connection.query(sql_site, sql_site_values, (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).send('An error occurred while adding the site.');
    }
  });
  res.redirect('/dashboard/sites');
});

router.get('/added_site', (req, res) => {
  res.redirect('/dashboard/sites');
});

router.get('/dashboard/sites/add_site/', (req, res) => {
  try {
    const locals = {
        title: "Add Site",
        description: "NB-IoT Data Portal"
        }
    connection.query('SELECT project_id FROM projects', (error, results) => {
      if (error) throw error;
      res.render('admin/add_site', { 
        locals,
        layout: adminLayout,
        projects: results
      });
    });
    } catch (error) {
      console.log(error);
    }
});

router.get('/dashboard/sites/:site_slug/edit', (req, res) => {
  try {
    const locals = {
        title: "Edit Site",
        description: "NB-IoT Data Portal"
        }
    const { site_slug } = req.params;

    let site;
    let projects;
    connection.query('SELECT * FROM sites WHERE site_id = ?', [site_slug], (err, results) => {
      if (err) {
        console.error('Error fetching site details:', err);
        // Handle the error
        return res.status(500).send('Internal Server Error');
      }
      if (results.length === 0) {
        // Project not found
        return res.status(404).send('Site not found');
      }
      site = results[0];
    });
    
    connection.query('SELECT project_id FROM projects', (error, results) => {
      if (error) throw error;
      projects = results;
      res.render('admin/edit_site', { 
        locals,
        layout: adminLayout,
        site_slug,
        site,
        projects
        });
    });
    } catch (error) {
      console.log(error);
    }
  });

router.post('/dashboard/sites/:site_slug/edited', (req, res) => {
  const site = req.params.site_slug
  const siteName = req.body.siteId;
  const projectId = req.body.project;
  const latitude = req.body.latitude;
  const longitude = req.body.longitude;

  const deviceType = req.body.type;
  const deviceSerialNumber = req.body.serialNumber;

  const coverLevel = req.body.coverLevel;
  const invertLevel = req.body.invertLevel;
  const sensorInvertDistance = req.body.sensor_invert_distance;
  const firstWaterAlertLevel = req.body.firstWaterAlertLevel;
  const secondWaterAlertLevel = req.body.secondWaterAlertLevel;
  const firstWaterAlertActive = req.body.firstWaterAlertActive;
  const secondWaterAlertActive = req.body.secondWaterAlertActive;

  const sql_site = `UPDATE Sites SET site_name = ?, project_id = ?, position_latitude = ?, position_longitude = ?, device_type = ?, 
    device_serial_number = ?, cover_level = ?, invert_level = ?, sensor_invert_distance = ?, first_water_alert_level = ?, second_water_alert_level = ?, 
    first_water_alert_active = ?, second_water_alert_active = ? WHERE site_id = ?`;
  const sql_site_values = [siteName, projectId, latitude, longitude, deviceType, deviceSerialNumber, coverLevel, invertLevel, 
    sensorInvertDistance, firstWaterAlertLevel, secondWaterAlertLevel, firstWaterAlertActive, secondWaterAlertActive, site];
  
  connection.query(sql_site, sql_site_values, (err, results) => {
    if (err) {
      console.error('Error updating site:', err);
      
      return res.status(500).send('Internal Server Error');
    }
    res.redirect('/dashboard/sites/');
  });
});

router.get('/dashboard/sites/:site_slug/deleted', (req, res) => {
  const { site_slug } = req.params;

  connection.query('DELETE FROM Sites WHERE site_id = ?', [site_slug], (err, result) => {
    if (err) {
      console.error('Error deleting site:', err);
      // Handle the error
      return res.status(500).send('Internal Server Error');
    }
      res.redirect('/dashboard/sites/');
    });
});

//routes for site data pages
router.get('/dashboard/sites/:site_slug', async (req, res) => {
  try {
    const locals = {
        title: "Site Data",
        description: "NB-IoT Data Portal"
        }
    const { site_slug } = req.params;
    connection.query(`SELECT * FROM sites WHERE site_id = ?`, [site_slug], (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        return;
      }
      const siteDetails = results[0];

      const query = `SELECT * FROM \`${siteDetails.device_serial_number}\`;`;
      connection.query(query, (error, results) => {
        if (error) {
          console.error('Error executing query:', error);
          return;
        }
        res.render(`logs/${siteDetails.device_type}.ejs`, { 
          locals,
          site_slug,
          siteDetails,
          data: results,
          location_data: JSON.stringify(siteDetails),
          graphdata: JSON.stringify(results), // Stringify the data array
          layout: adminLayout,
          currentRoute: '/'
          });
      });    
    });
    } catch (error) {
      console.log(error);
    }
});

//routes for full page pages
router.get('/dashboard/full_map/', (req, res) => {
  try {
    const locals = {
        title: "Full Map",
        description: "NB-IoT Data Portal"
        }
    connection.query('SELECT * FROM sites', (error, results) => {
      if (error) throw error;
      const locationDataArray = results.map(site => ({
        position_latitude: site.position_latitude,
        position_longitude: site.position_longitude
      }));
      res.render('admin/full_map', { 
        locals,
        layout: adminLayout,
        location_data: JSON.stringify(locationDataArray)
      });
    });
    } catch (error) {
      console.log(error);
    }
});



module.exports = router;