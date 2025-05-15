export const chartOptions = {
  scoreStatsOptions: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Thống kê điểm theo round',
      },
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Điểm',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Round',
        },
      },
    },
  },

  teacherOptions: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Số lượng sinh viên theo giảng viên',
      },
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Số lượng',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Giảng viên',
        },
      },
    },
  },

  classStatsOptions: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Tỷ lệ đạt/rớt theo lớp',
      },
    },
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: 'Lớp',
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Số lượng sinh viên',
        },
      },
    },
  },

  submitStatusOptions: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Tình trạng nộp đồ án của sinh viên',
      },
      legend: {
        position: 'bottom',
      },
    },
  },
};
