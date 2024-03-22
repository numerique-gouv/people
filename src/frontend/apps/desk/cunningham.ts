const config = {
  themes: {
    default: {
      theme: {
        colors: {
          'card-border': '#DDDDDD',
          'primary-bg': '#FAFAFA',
          'primary-100': '#EDF5FA',
          'primary-150': '#E5EEFA',
          'info-150': '#E5EEFA',
        },
        font: {
          sizes: {
            ml: '0.938rem',
            xl: '1.50rem',
            t: '0.6875rem',
            s: '0.75rem',
            h1: '2.2rem',
            h2: '1.7rem',
            h3: '1.37rem',
            h4: '1.15rem',
            h5: '1rem',
            h6: '0.87rem',
          },
          weights: {
            thin: 100,
            extrabold: 800,
            black: 900,
          },
        },
        spacings: {
          '0': '0',
          none: '0',
          auto: 'auto',
          bx: '2.2rem',
          full: '100%',
        },
        breakpoints: {
          xxs: '320px',
          xs: '480px',
        },
      },
      components: {
        datagrid: {
          header: {
            weight: 'var(--c--theme--font--weights--extrabold)',
            size: 'var(--c--theme--font--sizes--ml)',
          },
          cell: {
            color: 'var(--c--theme--colors--primary-500)',
            size: 'var(--c--theme--font--sizes--ml)',
          },
        },
        'forms-checkbox': {
          'background-color': {
            hover: '#055fd214',
          },
          color: 'var(--c--theme--colors--primary-500)',
          'font-size': 'var(--c--theme--font--sizes--ml)',
        },
        'forms-datepicker': {
          'border-color': 'var(--c--theme--colors--primary-500)',
          'value-color': 'var(--c--theme--colors--primary-500)',
          'border-radius': {
            hover: 'var(--c--components--forms-datepicker--border-radius)',
            focus: 'var(--c--components--forms-datepicker--border-radius)',
          },
        },
        'forms-field': {
          color: 'var(--c--theme--colors--primary-500)',
          'value-color': 'var(--c--theme--colors--primary-500)',
          width: 'auto',
        },
        'forms-input': {
          'value-color': 'var(--c--theme--colors--primary-500)',
          'border-color': 'var(--c--theme--colors--primary-500)',
          color: {
            error: 'var(--c--theme--colors--danger-500)',
            'error-hover': 'var(--c--theme--colors--danger-500)',
            'box-shadow-error-hover': 'var(--c--theme--colors--danger-500)',
          },
        },
        'forms-labelledbox': {
          'label-color': {
            small: 'var(--c--theme--colors--primary-500)',
            'small-disabled': 'var(--c--theme--colors--greyscale-400)',
            big: {
              disabled: 'var(--c--theme--colors--greyscale-400)',
            },
          },
        },
        'forms-select': {
          'border-color': 'var(--c--theme--colors--primary-500)',
          'border-color-disabled-hover':
            'var(--c--theme--colors--greyscale-200)',
          'border-radius': {
            hover: 'var(--c--components--forms-select--border-radius)',
            focus: 'var(--c--components--forms-select--border-radius)',
          },
          'font-size': 'var(--c--theme--font--sizes--ml)',
          'menu-background-color': '#ffffff',
          'item-background-color': {
            hover: 'var(--c--theme--colors--primary-300)',
          },
        },
        'forms-switch': {
          'accent-color': 'var(--c--theme--colors--primary-400)',
        },
        'forms-textarea': {
          'border-color': 'var(--c--components--forms-textarea--border-color)',
          'border-color-hover':
            'var(--c--components--forms-textarea--border-color)',
          'border-radius': {
            hover: 'var(--c--components--forms-textarea--border-radius)',
            focus: 'var(--c--components--forms-textarea--border-radius)',
          },
          color: 'var(--c--theme--colors--primary-500)',
          disabled: {
            'border-color-hover': 'var(--c--theme--colors--greyscale-200)',
          },
        },
        modal: {
          'background-color': '#ffffff',
        },
        button: {
          'border-radius': {
            active: 'var(--c--components--button--border-radius)',
          },
          'medium-height': 'auto',
          'small-height': 'auto',
          success: {
            color: 'white',
            'color-disabled': 'white',
            'color-hover': 'white',
            background: {
              color: 'var(--c--theme--colors--success-600)',
              'color-disabled': 'var(--c--theme--colors--greyscale-300)',
              'color-hover': 'var(--c--theme--colors--success-800)',
            },
          },
          danger: {
            'color-hover': 'white',
            background: {
              color: 'var(--c--theme--colors--danger-400)',
              'color-hover': 'var(--c--theme--colors--danger-500)',
              'color-disabled': 'var(--c--theme--colors--danger-100)',
            },
          },
          primary: {
            color: 'var(--c--theme--colors--primary-text)',
            'color-active': 'var(--c--theme--colors--primary-text)',
            background: {
              color: 'var(--c--theme--colors--primary-400)',
              'color-active': 'var(--c--theme--colors--primary-500)',
            },
            border: {
              'color-active': 'transparent',
            },
          },
          secondary: {
            color: 'var(--c--theme--colors--primary-500)',
            'color-hover': 'var(--c--theme--colors--primary-text)',
            background: {
              color: 'white',
              'color-hover': 'var(--c--theme--colors--primary-700)',
            },
            border: {
              color: 'var(--c--theme--colors--primary-200)',
            },
          },
          tertiary: {
            color: 'var(--c--theme--colors--primary-text)',
            'color-disabled': 'var(--c--theme--colors--greyscale-600)',
            background: {
              'color-hover': 'var(--c--theme--colors--primary-100)',
              'color-disabled': 'var(--c--theme--colors--greyscale-200)',
            },
          },
          disabled: {
            color: 'white',
            background: {
              color: '#b3cef0',
            },
          },
        },
      },
    },
    dsfr: {
      theme: {
        colors: {
          'card-border': '#DDDDDD',
          'primary-text': '#000091',
          'primary-100': '#f5f5fe',
          'primary-200': '#ececfe',
          'primary-300': '#e3e3fd',
          'primary-400': '#cacafb',
          'primary-500': '#6a6af4',
          'primary-600': '#000091',
          'primary-700': '#272747',
          'primary-800': '#21213f',
          'primary-900': '#1c1a36',
          'secondary-text': '#FFFFFF',
          'secondary-100': '#fee9ea',
          'secondary-200': '#fedfdf',
          'secondary-300': '#fdbfbf',
          'secondary-400': '#e1020f',
          'secondary-500': '#c91a1f',
          'secondary-600': '#5e2b2b',
          'secondary-700': '#3b2424',
          'secondary-800': '#341f1f',
          'secondary-900': '#2b1919',
          'greyscale-text': '#303C4B',
          'greyscale-000': '#f6f6f6',
          'greyscale-100': '#eeeeee',
          'greyscale-200': '#e5e5e5',
          'greyscale-300': '#e1e1e1',
          'greyscale-400': '#dddddd',
          'greyscale-500': '#cecece',
          'greyscale-600': '#7b7b7b',
          'greyscale-700': '#666666',
          'greyscale-800': '#2a2a2a',
          'greyscale-900': '#1e1e1e',
          'success-text': '#1f8d49',
          'success-100': '#dffee6',
          'success-200': '#b8fec9',
          'success-300': '#88fdaa',
          'success-400': '#3bea7e',
          'success-500': '#1f8d49',
          'success-600': '#18753c',
          'success-700': '#204129',
          'success-800': '#1e2e22',
          'success-900': '#19281d',
          'info-text': '#0078f3',
          'info-100': '#f4f6ff',
          'info-200': '#e8edff',
          'info-300': '#dde5ff',
          'info-400': '#bdcdff',
          'info-500': '#0078f3',
          'info-600': '#0063cb',
          'info-700': '#f4f6ff',
          'info-800': '#222a3f',
          'info-900': '#1d2437',
          'warning-text': '#d64d00',
          'warning-100': '#fff4f3',
          'warning-200': '#ffe9e6',
          'warning-300': '#ffded9',
          'warning-400': '#ffbeb4',
          'warning-500': '#d64d00',
          'warning-600': '#b34000',
          'warning-700': '#5e2c21',
          'warning-800': '#3e241e',
          'warning-900': '#361e19',
          'danger-text': '#e1000f',
          'danger-100': '#fef4f4',
          'danger-200': '#fee9e9',
          'danger-300': '#fddede',
          'danger-400': '#fcbfbf',
          'danger-500': '#e1000f',
          'danger-600': '#c9191e',
          'danger-700': '#642727',
          'danger-800': '#412121',
          'danger-900': '#3a1c1c',
        },
        font: {
          families: {
            accent: 'Marianne',
            base: 'Marianne',
          },
        },
      },
      components: {
        alert: {
          'border-radius': '0',
        },
        button: {
          'medium-height': '48px',
          'border-radius': '4px',
          primary: {
            background: {
              color: 'var(--c--theme--colors--primary-text)',
              'color-hover': '#1212ff',
              'color-active': '#2323ff',
            },
            color: '#ffffff',
            'color-hover': '#ffffff',
            'color-active': '#ffffff',
          },
          'primary-text': {
            background: {
              'color-hover': 'var(--c--theme--colors--primary-100)',
              'color-active': 'var(--c--theme--colors--primary-100)',
            },
            'color-hover': 'var(--c--theme--colors--primary-text)',
          },
          secondary: {
            background: {
              'color-hover': '#F6F6F6',
              'color-active': '#EDEDED',
            },
            border: {
              color: 'var(--c--theme--colors--primary-600)',
              'color-hover': 'var(--c--theme--colors--primary-600)',
            },
            color: 'var(--c--theme--colors--primary-text)',
          },
          'tertiary-text': {
            background: {
              'color-hover': 'var(--c--theme--colors--primary-100)',
            },
            'color-hover': 'var(--c--theme--colors--primary-text)',
          },
        },
        datagrid: {
          header: {
            color: 'var(--c--theme--colors--primary-text)',
            size: 'var(--c--theme--font--sizes--s)',
          },
          body: {
            'background-color': 'transparent',
            'background-color-hover': '#F4F4FD',
          },
          pagination: {
            'background-color': 'transparent',
            'background-color-active': 'var(--c--theme--colors--primary-300)',
          },
        },
        'forms-checkbox': {
          'border-radius': '0',
          color: 'var(--c--theme--colors--primary-text)',
        },
        'forms-datepicker': {
          'border-radius': '0',
        },
        'forms-fileuploader': {
          'border-radius': '0',
        },
        'forms-field': {
          color: 'var(--c--theme--colors--primary-text)',
        },
        'forms-input': {
          'border-radius': '4px',
          'background-color': '#ffffff',
          'border-color': 'var(--c--theme--colors--primary-text)',
          'box-shadow-color': 'var(--c--theme--colors--primary-text)',
          'value-color': 'var(--c--theme--colors--primary-text)',
        },
        'forms-labelledbox': {
          'label-color': {
            big: 'var(--c--theme--colors--primary-text)',
          },
        },
        'forms-select': {
          'border-radius': '4px',
          'border-radius-hover': '4px',
          'background-color': '#ffffff',
          'border-color': 'var(--c--theme--colors--primary-text)',
          'border-color-hover': 'var(--c--theme--colors--primary-text)',
          'box-shadow-color': 'var(--c--theme--colors--primary-text)',
        },
        'forms-switch': {
          'handle-border-radius': '2px',
          'rail-border-radius': '4px',
        },
        'forms-textarea': {
          'border-radius': '0',
        },
      },
    },
  },
};

export default config;
