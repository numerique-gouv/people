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
          'grey-400': '#929292',
          'grey-800': '#2A2A2A',
        },
        font: {
          letterSpacings: {
            h5: 'normal',
          },
          sizes: {
            ml: '0.938rem',
            xl: '1.25rem',
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
      },
    },
    dsfr: {
      theme: {
        colors: {
          'primary-100': '#F5F5FE',
          'primary-150': '#F4F4FD',
          'primary-200': '#ECECFE',
          'primary-300': '#E3E3FD',
          'primary-400': '#CACAFB',
          'primary-500': '#8585F6',
          'primary-600': '#6A6AF4',
          'primary-700': '#000091',
          'primary-800': '#21213f',
          'primary-900': '#1c1a36',
          'secondary-100': '#fee9ea',
          'secondary-200': '#fedfdf',
          'secondary-300': '#fdbfbf',
          'secondary-400': '#e1020f',
          'secondary-500': '#c91a1f',
          'secondary-600': '#5e2b2b',
          'secondary-700': '#3b2424',
          'secondary-800': '#341f1f',
          'secondary-900': '#2b1919',
          'greyscale-000': '#ffffff',
          'greyscale-050': '#F6F6F6',
          'greyscale-100': '#EEEEEE',
          'greyscale-200': '#E5E5E5',
          'greyscale-300': '#CECECE',
          'greyscale-400': '#929292',
          'greyscale-500': '#7A7A7A',
          'greyscale-600': '#666666',
          'greyscale-700': '#3A3A3A',
          'greyscale-800': '#2A2A2A',
          'greyscale-900': '#1E1E1E',
          'greyscale-1000': '#161616',
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
          'background-color': 'var(--c--theme--colors--greyscale-000)',
        },
        modal: {
          'box-shadow': '0px 6px 18px 0px rgba(0, 0, 18, 0.16);',
        },
        button: {
          'medium-height': '48px',
          'border-radius': '0',
          'medium-text-height': '48px',
          primary: {
            background: {
              color: 'var(--c--theme--colors--primary-700)',
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

            'color-hover': 'var(--c--theme--colors--primary-700)',
          },
          secondary: {
            background: {
              'color-hover': '#F6F6F6',
              'color-active': '#EDEDED',
            },
            border: {
              color: 'var(--c--theme--colors--primary-700)',
              'color-hover': 'var(--c--theme--colors--primary-600)',
            },
            color: 'var(--c--theme--colors--primary-700)',
            ['color-hover']: 'var(--c--theme--colors--primary-600)',
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
            color: 'var(--c--theme--colors--primary-600)',
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
        'forms-datepicker': {
          'border-radius': '0',
        },
        'forms-fileuploader': {
          'border-radius': '0',
        },
        'forms-input': {
          'background-color': 'var(--c--theme--colors--greyscale-050)',
          'border-radius': '5px 5px 0 0',

          'border-color': 'var(--c--theme--colors--greyscale-100)',

          'border-color--focus': 'var(--c--theme--colors--greyscale-900)',
          'border-width': '0 0 2px 0',
          'label-color--focus':
            'var(--c--components--forms-labelledbox--label-color--small)',
        },
        'forms-textarea': {
          'background-color': 'var(--c--theme--colors--greyscale-050)',
          'border-radius': '5px 5px 0 0',
          'border-color': 'var(--c--theme--colors--greyscale-100)',
          'border-color--focus': 'var(--c--theme--colors--greyscale-900)',
          'border-width': '0 0 2px 0',
          'border-color--hover': 'var(--c--theme--colors--greyscale-900)',
          'label-color--focus':
            'var(--c--components--forms-labelledbox--label-color--small)',
        },
        'forms-select': {
          'background-color': 'var(--c--theme--colors--greyscale-100)',
          'border-radius': '0',
          'border-color': 'var(--c--theme--colors--greyscale-900)',
          'border-width': '0 0 2px 0',
          'border-color--focus': '#0974F6',
          'border-color--hover': 'var(--c--theme--colors--greyscale-900)',
          'label-color--focus':
            'var(--c--components--forms-labelledbox--label-color--big)',
        },
        'forms-switch': {
          'accent-color': '#2323ff',
        },
        'forms-checkbox': {
          'accent-color': '#2323ff',
        },
      },
    },
  },
};

export default config;
