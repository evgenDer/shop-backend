CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS products (
    id uuid DEFAULT uuid_generate_v4 (),
    title TEXT NOT NULL,
    description TEXT,
    price integer,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS stocks (
	id uuid DEFAULT uuid_generate_v4(),
    product_id uuid,
    count integer,
    primary KEY(id),
    foreign key ("product_id") references "products" ("id")
);

insert into products (title, description, price) values 
('Eloquent JavaScript', 'JavaScript lies at the heart of almost every modern web application, from social apps to the newest browser-based games. Though simple for beginners to pick up and play with, JavaScript is a flexible, complex language that you can use to build full-scale applications.', 15),
('Git Pocket Guide', 'This pocket guide is the perfect on-the-job companion to Git, the distributed version control system. It provides a compact, readable introduction to Git for new users, as well as a reference to common commands and procedures for those of you with Git experience.', 30),
('Speaking JavaScript', 'Like it or not, JavaScript is everywhere these days-from browser to server to mobile-and now you, too, need to learn the language or dive deeper than you have. This concise book guides you into and through JavaScript, written by a veteran programmer who once found himself in the same position.', 25),
('Learning JavaScript Design Patterns', 'With Learning JavaScript Design Patterns, you will learn how to write beautiful, structured, and maintainable JavaScript by applying classical and modern design patterns to the language. If you want to keep your code efficient, more manageable, and up-to-date with the latest best practices, this book is for you.', 35),
('Programming JavaScript Applications', 'Take advantage of JavaScripts power to build robust web-scale or enterprise applications that are easy to extend and maintain. By applying the design patterns outlined in this practical book, experienced JavaScript developers will learn how to write flexible and resilient code that is easier-yes, easier-to work with as your code base grows.', 45),
('Designing Evolvable Web APIs with ASP.NET', 'Design and build Web APIs for a broad range of clients—including browsers and mobile devices—that can adapt to change over time. This practical, hands-on guide takes you through the theory and tools you need to build evolvable HTTP services with Microsoft’s ASP.NET Web API framework. In the process, you’ll learn how design and implement a real-world Web API.', 35);

select * from products;

insert into stocks (product_id, count) values
((select id from products where title = 'Eloquent JavaScript'), 14),
((select id from products where title = 'Speaking JavaScript'), 15),
((select id from products where title = 'Git Pocket Guide'), 8),
((select id from products where title = 'Learning JavaScript Design Patterns'), 18),
((select id from products where title = 'Programming JavaScript Applications'), 12),
((select id from products where title = 'Designing Evolvable Web APIs with ASP.NET'), 11);

select * from stocks; 