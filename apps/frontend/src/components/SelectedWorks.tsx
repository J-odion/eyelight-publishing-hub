import audacityOfFaith from "@/assets/books/audacity-of-faith.jpg";
import roadToBestseller from "@/assets/books/road-to-bestseller.jpg";
import expectedEnd from "@/assets/books/expected-end.jpg";
import princesshood from "@/assets/books/princesshood.jpg";
import bloom from "@/assets/books/bloom.jpg";
import selfLeadership from "@/assets/books/self-leadership.jpg";
import calledToCarryMen from "@/assets/books/called-to-carry-men.jpg";

const works = [
  {
    title: "Audacity of Faith",
    author: "Apostle Femi Lazarus",
    description:
      "A compelling work that teaches that faith produces more than results but largely shapes character. The book has received widespread acclaim, with readers testifying to its transformative impact.",
    image: audacityOfFaith,
    link: "https://www.instagram.com/thefemilazarusbooks?igsh=bjZleGR5bXJzc3Vy",
  },
  {
    title: "Road to Bestseller",
    author: "Grace Akowe Apara",
    description:
      "A practical roadmap for aspiring writers. Now available in paperback, the book provides actionable steps and strategic insights into the publishing process.",
    image: roadToBestseller,
    link: "http://graceapara.com/books",
  },
  {
    title: "Expected End",
    author: "Barrister Peace Aaron",
    description:
      "A heartfelt memoir chronicling her life journey with honesty and inspiring vulnerability, offering readers a message of hope and resilience.",
    image: expectedEnd,
  },
  {
    title: "Princesshood",
    author: "Sharon Adetola",
    description:
      "A powerful and inspiring book that explores the value of women in God's eyes. A must-read for every young woman seeking to deepen their faith in Christ.",
    image: princesshood,
  },
  {
    title: "Bloom",
    author: "Margaret Ogbolu",
    description:
      "The Courage to Grow Beyond Survival. Eyelight Service is proud to have contributed to the development and presentation of this impactful work.",
    image: bloom,
  },
  {
    title: "This Thing Called Self-Leadership",
    author: "Grace Akowe Apara",
    description:
      "A compelling guide to self-discovery, responsibility, and purposeful living. Its success is rooted in relatable storytelling and the author's inspiring journey.",
    image: selfLeadership,
    link: "http://graceapara.com/books",
  },
  {
    title: "Called to Carry Men",
    author: "Femi Lazarus",
    description:
      "The Work, The Weight, The Discipline and The Wisdom of Pastoral Leadership. A monumental work spanning over two thousand pages by a truly exceptional author.",
    image: calledToCarryMen,
  },
];

const SelectedWorks = () => {
  return (
    <section id="selected-works" className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">
            Portfolio
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Selected Works <span className="text-accent">We've Been a Part Of</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {works.map((work, i) => {
            const content = (
              <div
                className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-card hover:border-accent/30 transition-all"
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={work.image}
                    alt={`${work.title} by ${work.author}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold text-foreground mb-1">{work.title}</h3>
                  <p className="text-xs font-medium text-accent mb-2">{work.author}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {work.description}
                  </p>
                </div>
              </div>
            );

            return work.link ? (
              <a key={i} href={work.link} target="_blank" rel="noopener noreferrer">
                {content}
              </a>
            ) : (
              <div key={i}>{content}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SelectedWorks;
