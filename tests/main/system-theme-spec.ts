import { ipcMainManager } from '../../src/main/ipc';
import { setupSystemTheme } from '../../src/main/system-theme';
import { IpcEvents } from '../../src/ipc-events';
import { nativeTheme } from 'electron';

describe('system theme', () => {
  describe('setupSystemTheme()', () => {
    beforeEach(() => {
      ipcMainManager.send = jest.fn();
    });
    afterEach(() => {
      ipcMainManager.removeAllListeners();
      nativeTheme.removeAllListeners();
    });

    it('sets the themeSource on IPC', (done) => {
      setupSystemTheme();
      ipcMainManager.emit(IpcEvents.SET_THEME_SOURCE, undefined, 'dark');
      process.nextTick(() => {
        expect(nativeTheme.themeSource).toBe('dark');
        ipcMainManager.emit(IpcEvents.SET_THEME_SOURCE, undefined, 'light');
        process.nextTick(() => {
          expect(nativeTheme.themeSource).toBe('light');
          ipcMainManager.emit(IpcEvents.SET_THEME_SOURCE, undefined, 'system');
          process.nextTick(() => {
            expect(nativeTheme.themeSource).toBe('system');
            done();
          });
        });
      });
    });

    describe('sends info about system theme to renderer on load and on update event', () => {
      it('no-op if not system', (done) => {
        nativeTheme.themeSource = 'dark';

        setupSystemTheme();
        nativeTheme.emit('updated');
        process.nextTick(() => {
          expect((ipcMainManager.send as jest.Mock).mock.calls).toHaveLength(0);
          done();
        });
      });

      it('system (dark)', (done) => {
        nativeTheme.themeSource = 'system';
        // cast to make property read-only
        (nativeTheme.shouldUseDarkColors as boolean) = true;

        setupSystemTheme();

        nativeTheme.emit('updated');
        process.nextTick(() => {
          expect((ipcMainManager.send as jest.Mock).mock.calls).toEqual([
            [IpcEvents.SET_SYSTEM_THEME, [true]],
            [IpcEvents.SET_SYSTEM_THEME, [true]],
          ]);
          done();
        });
      });

      it('system (light)', (done) => {
        nativeTheme.themeSource = 'system';
        // cast to make property read-only
        (nativeTheme.shouldUseDarkColors as boolean) = false;

        setupSystemTheme();

        nativeTheme.emit('updated');
        process.nextTick(() => {
          expect((ipcMainManager.send as jest.Mock).mock.calls).toEqual([
            [IpcEvents.SET_SYSTEM_THEME, [false]],
            [IpcEvents.SET_SYSTEM_THEME, [false]],
          ]);
          done();
        });
      });
    });
  });
});
