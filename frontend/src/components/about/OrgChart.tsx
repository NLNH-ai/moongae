import styles from './OrgChart.module.css'

const units = [
  {
    title: '\uc804\ub7b5 \uae30\ud68d',
    copy: '\uc0ac\uc5c5 \ud3ec\ud2b8\ud3f4\ub9ac\uc624\uc640 \ubbf8\ub798 \ud22c\uc790 \ubc29\ud5a5\uc744 \uc124\uacc4\ud569\ub2c8\ub2e4.',
  },
  {
    title: '\uc6b4\uc601 \ud601\uc2e0',
    copy: '\uc81c\uc870, \uc5d0\ub108\uc9c0, \ud50c\ub7ab\ud3fc \uc870\uc9c1\uc744 \uc5f0\uacb0\ud574 \uc2e4\ud589\ub825\uc744 \ub192\uc785\ub2c8\ub2e4.',
  },
  {
    title: '\ub514\uc9c0\ud138 \uc194\ub8e8\uc158',
    copy: '\ub370\uc774\ud130 \ubd84\uc11d, \uad00\uc81c, \uc790\ub3d9\ud654 \uc5ed\ub7c9\uc744 \uae30\ubc18\uc73c\ub85c \ud604\uc7a5\uc744 \uace0\ub3c4\ud654\ud569\ub2c8\ub2e4.',
  },
]

function OrgChart() {
  return (
    <section className={styles.section}>
      <span className="sectionEyebrow">Organization</span>
      <h2 className={styles.title}>{'\ud575\uc2ec \uc870\uc9c1'}</h2>
      <div className={styles.grid}>
        {units.map((unit, index) => (
          <article className={styles.card} key={unit.title}>
            <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
            <h3>{unit.title}</h3>
            <p>{unit.copy}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default OrgChart
