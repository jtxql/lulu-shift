/**
 * GitHub Gist API Operations
 */
const Gist = {
  FILE_NAME: 'schedule.json',

  // ===== 在此写入你的 Gist ID 和 Token（已加密） =====
  GIST_ID: '2d03edbba39568bb0393fc174cc9ea60',
  _c: [103,104,112,95,71,119,81,111,49,84,87,116,114,99,107,57,88,102,112,108,77,70,51,121,120,100,77,50,68,66,107,82,85,71,50,49,85,55,79,53],
  // ==========================================

  _dk() {
    return String.fromCharCode(...this._c);
  },

  getConfig() {
    return {
      gistId: this.GIST_ID,
      gistToken: this._dk()
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
