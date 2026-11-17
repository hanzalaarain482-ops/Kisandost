import { useEffect } from 'react'
import Icon from '../icons.jsx'
import { TopBar } from '../components.jsx'
import { speak } from '../speak.js'
import { weather } from '../data.js'

const iconFor = { sun: 'sun', cloud: 'cloud', rain: 'rain' }
const colorFor = { sun: 'var(--wheat)', cloud: '#7b8a83', rain: 'var(--sky)' }

export default function Weather({ onBack }) {
  const say = `آج ${weather.city} میں ${weather.today.text} ہے، ${weather.today.temp} ڈگری۔ ${weather.alert}`

  useEffect(() => {
    speak(say)
  }, [say])

  return (
    <>
      <TopBar title="موسم" onBack={onBack} speakText={say} />
      <div className="screen">
        <div className="weather-hero">
          <Icon name={iconFor[weather.today.type]} size={86} color="#ffd36b" />
          <div className="t">
            <span>{weather.city} · آج</span>
            <b>{weather.today.text}</b>
          </div>
          <span className="temp">{weather.today.temp}°</span>
        </div>

        <div className={'spray ' + (weather.sprayOk ? 'ok' : 'no')}>
          <Icon name={weather.sprayOk ? 'thumbUp' : 'thumbDown'} size={48} />
          <span>{weather.sprayOk ? 'آج اسپرے کر سکتے ہیں' : 'آج اسپرے نہ کریں'}</span>
        </div>

        <div className="days">
          {weather.days.map((d) => (
            <div key={d.day} className={'day' + (d.type === 'rain' ? ' rain' : '')}>
              <span>{d.day}</span>
              <Icon name={iconFor[d.type]} size={34} color={colorFor[d.type]} />
              <b>{d.temp}°</b>
            </div>
          ))}
        </div>

        <button type="button" className="alert-strip" onClick={() => speak(weather.alert)}>
          <Icon name="alert" size={34} color="#a06a00" />
          <span style={{ flex: 1 }}>{weather.alert}</span>
          <Icon name="speaker" size={26} />
        </button>
      </div>
    </>
  )
}
