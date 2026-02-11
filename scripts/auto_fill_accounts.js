
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(process.cwd(), 'data', 'data.db');
const db = new sqlite3.Database(dbPath);

const groups = [1, 2];
const remarks = ['内容质量高', '互动活跃', '潜力账号', '风格独特', '粉丝粘性高', '近期爆款多'];
const coopTypes = ['图文', '视频', '图文,视频'];
const contentTypes = ['美妆', '穿搭', '生活', '美食', '探店', '数码', '旅行'];
const features = ['种草能力强', '视觉精美', '干货满满', '人设鲜明', '性价比高', '粉丝活跃'];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomFeatures() {
  const num = 1 + Math.floor(Math.random() * 2);
  const result = [];
  for(let i=0; i<num; i++) {
    const f = getRandomItem(features);
    if (!result.includes(f)) result.push(f);
  }
  return result.join(',');
}

console.log('Starting to auto-fill account data...');

db.serialize(() => {
  db.all('SELECT * FROM accounts', [], (err, accounts) => {
    if (err) {
      console.error('Error fetching accounts:', err);
      return;
    }

    console.log(`Found ${accounts.length} accounts. Checking for missing data...`);

    const stmt = db.prepare(`
      UPDATE accounts SET 
        group_id = ?, 
        avg_read_count = ?, 
        comment_count = ?, 
        cooperation_type = ?, 
        remark = ?,
        extra_json = ?
      WHERE id = ?
    `);

    let updatedCount = 0;
    
    const updatePromises = accounts.map(acc => {
      return new Promise((resolve, reject) => {
        let needsUpdate = false;
        
        // --- 1. Base Fields ---
        let newGroupId = acc.group_id;
        if (!newGroupId) {
          newGroupId = getRandomItem(groups);
          needsUpdate = true;
        }

        let newAvgRead = acc.avg_read_count;
        if (newAvgRead === null || newAvgRead === '' || newAvgRead === undefined) {
          const fans = acc.fans_count || 1000;
          newAvgRead = Number((fans * (0.05 + Math.random() * 0.15)).toFixed(2));
          needsUpdate = true;
        }

        let newCommentCount = acc.comment_count;
        if (newCommentCount === null || newCommentCount === '' || newCommentCount === undefined) {
          const likes = acc.like_count || (newAvgRead * 0.1);
          newCommentCount = Number((likes * (0.1 + Math.random() * 0.2)).toFixed(2));
          needsUpdate = true;
        }

        let newCoopType = acc.cooperation_type;
        if (!newCoopType) {
          newCoopType = getRandomItem(coopTypes);
          needsUpdate = true;
        }

        let newRemark = acc.remark;
        if (!newRemark) {
          newRemark = getRandomItem(remarks);
          needsUpdate = true;
        }

        // --- 2. Extra JSON Fields ---
        let extra = {};
        try {
          extra = JSON.parse(acc.extra_json || '{}');
        } catch (e) {
          extra = {};
        }
        
        let jsonChanged = false;
        if (!extra.email) {
          extra.email = `user_${acc.id}@example.com`;
          jsonChanged = true;
        }
        if (!extra.content_type) {
          extra.content_type = getRandomItem(contentTypes);
          jsonChanged = true;
        }
        if (!extra.account_features) {
          extra.account_features = getRandomFeatures();
          jsonChanged = true;
        }
        if (!extra.rednote_id) {
          extra.rednote_id = `xhs_${acc.id}_${Math.floor(Math.random() * 1000)}`;
          jsonChanged = true;
        }
        if (!extra.interaction_rate || extra.interaction_rate == 0) {
          extra.interaction_rate = Number((1 + Math.random() * 9).toFixed(2));
          jsonChanged = true;
        }
        if (!extra.commission_rate || extra.commission_rate == 0) {
          extra.commission_rate = Math.floor(5 + Math.random() * 15);
          jsonChanged = true;
        }

        if (jsonChanged) {
          needsUpdate = true;
        }

        if (needsUpdate) {
          const newJson = JSON.stringify(extra);
          stmt.run(newGroupId, newAvgRead, newCommentCount, newCoopType, newRemark, newJson, acc.id, (err) => {
            if (err) reject(err);
            else {
              updatedCount++;
              resolve();
            }
          });
        } else {
          resolve();
        }
      });
    });

    Promise.all(updatePromises)
      .then(() => {
        stmt.finalize();
        console.log(`Successfully updated ${updatedCount} accounts.`);
        db.close();
      })
      .catch(err => {
        console.error('Error during updates:', err);
        stmt.finalize();
        db.close();
      });
  });
});
