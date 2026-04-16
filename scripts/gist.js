/**
 * GitHub Gist API Operations
 */
const Gist = {
  FILE_NAME: 'schedule.json',

  // ===== 在此写入你的 Gist ID 和 Token =====
  GIST_ID: '2d03edbba39568bb0393fc174cc9ea60',
  GIST_TOKEN: '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',
  // ==========================================

  getConfig() {
    return {
      gistId: this.GIST_ID,
      gistToken: this.GIST_TOKEN
    };
  },

  async load() {
    const config = this.getConfig();

    try {
      const response = await fetch(`https://api.github.com/gists/${config.gistId}`, {
        headers: {
          'Authorization': `Bearer ${config.gistToken}`,
          'Accept': 'application/vnd.github+json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const file = data.files[this.FILE_NAME];

      if (file) {
        return JSON.parse(file.content);
      }

      return this.getDefaultData();
    } catch (error) {
      console.error('Failed to load Gist:', error);
      return this.getDefaultData();
    }
  },

  async save(schedules) {
    const config = this.getConfig();

    try {
      const loadResponse = await fetch(`https://api.github.com/gists/${config.gistId}`, {
        headers: {
          'Authorization': `Bearer ${config.gistToken}`,
          'Accept': 'application/vnd.github+json'
        }
      });

      if (!loadResponse.ok) {
        throw new Error(`HTTP ${loadResponse.status}`);
      }

      const gistData = await loadResponse.json();
      const currentFiles = gistData.files;

      const saveResponse = await fetch(`https://api.github.com/gists/${config.gistId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${config.gistToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github+json'
        },
        body: JSON.stringify({
          files: {
            ...currentFiles,
            [this.FILE_NAME]: {
              content: JSON.stringify({ schedules }, null, 2)
            }
          }
        })
      });

      if (!saveResponse.ok) {
        throw new Error(`HTTP ${saveResponse.status}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to save Gist:', error);
      App.showToast('保存失败');
      return false;
    }
  },

  getDefaultData() {
    return {
      schedules: []
    };
  }
};
